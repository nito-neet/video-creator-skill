/**
 * 書き出した MP4 を数字で確かめる。**「できました」と言う前に必ず通す。**
 *
 *   node scripts/verify-output.mjs output/final-vertical.mp4
 *   node scripts/verify-output.mjs            （output/*.mp4 を全部）
 *
 * Remotion 同梱の ffmpeg / ffprobe を使うので、**ffmpeg を入れていなくても動く。**
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {findFfmpeg} from './find-ffmpeg.mjs';

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.\w+$/.test(spec)) {
      try {
        return next(spec + '.ts', ctx);
      } catch {
        /* そのまま次へ */
      }
    }
    return next(spec, ctx);
  },
});

const {DURATION, FPS} = await import('../src/config/theme.ts');

const tools = findFfmpeg();
if (!tools) {
  console.log('ffmpeg / ffprobe が見つかりません。`npm install` を先に通してください。');
  process.exit(1);
}

const targets = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = targets.length
  ? targets
  : fs.existsSync('output')
    ? fs.readdirSync('output').filter((f) => f.endsWith('.mp4')).map((f) => path.join('output', f))
    : [];

if (!files.length) {
  console.log('確かめる MP4 がありません。先に `npm run render:v` を実行してください。');
  process.exit(1);
}

// Windows の改行（CRLF）が値にくっつくので、行ごとに trim する
const probe = (file, args) =>
  execFileSync(tools.ffprobe, ['-v', 'error', ...args, '-of', 'default=nw=1:nk=1', file], {stdio: 'pipe'})
    .toString()
    .trim()
    .split(/\r?\n/)
    .map((s) => s.trim());

/** 音声を WAV に取り出して、いちばん大きいサンプルを測る（音割れの確認）。 */
const audioPeak = (file) => {
  const tmp = path.join(os.tmpdir(), `verify-${Date.now()}.wav`);
  try {
    execFileSync(tools.ffmpeg, ['-y', '-v', 'error', '-i', file, '-vn', '-f', 'wav', '-acodec', 'pcm_s16le', tmp], {
      stdio: 'pipe',
    });
    const b = fs.readFileSync(tmp);
    let max = 0;
    for (let i = 44; i + 1 < b.length; i += 2) {
      const v = Math.abs(b.readInt16LE(i));
      if (v > max) max = v;
    }
    return max === 0 ? null : 20 * Math.log10(max / 32768);
  } catch {
    return null;
  } finally {
    fs.rmSync(tmp, {force: true});
  }
};

let ng = 0;
for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`× ${file} がありません`);
    ng++;
    continue;
  }
  const [w, h, rate, nb] = probe(file, ['-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames']);
  const [acodec, sr, ch] = probe(file, ['-select_streams', 'a:0', '-show_entries', 'stream=codec_name,sample_rate,channels']);
  const fps = rate.includes('/') ? Number(rate.split('/')[0]) / Number(rate.split('/')[1]) : Number(rate);
  const frames = Number(nb);
  const peak = audioPeak(file);

  const checks = [
    [`${w}x${h}`, Number(w) > 0 && Number(h) > 0, '解像度'],
    [`${fps} fps`, Math.abs(fps - FPS) < 0.01, `fps（設計は ${FPS}）`],
    [`${frames} フレーム（${(frames / FPS).toFixed(3)}秒）`, frames === DURATION, `フレーム数（設計は ${DURATION}）`],
    [acodec ? `${acodec} ${sr}Hz ${ch}ch` : '音声なし', Boolean(acodec), '音声'],
    [
      peak === null ? '測れなかった' : `${peak.toFixed(2)} dBFS`,
      peak !== null && peak < -0.1,
      '音量ピーク（0 に届いていたら音割れ）',
    ],
  ];

  console.log('');
  console.log(`  ${path.basename(file)}  (${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB)`);
  for (const [value, pass, label] of checks) {
    console.log(`   ${pass ? '○' : '×'} ${label}: ${value}`);
    if (!pass) ng++;
  }
}

console.log('');
if (ng) {
  console.log(`  ${ng} 件おかしいところがあります。上の × を直してから納品してください。`);
  process.exitCode = 1;
} else {
  console.log('  すべて設計どおりです。');
}
console.log(`  （検証に使ったツール: ${tools.bundled ? 'Remotion 同梱の ffmpeg' : 'システムの ffmpeg'}）`);
console.log('');
