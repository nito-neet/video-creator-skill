/**
 * 静止画チェック用。指定フレームを書き出して、1枚の一覧画像にする。
 *
 *   node scripts/make-contactsheet.mjs --set=key --cols=6 --scale=0.3
 *   node scripts/make-contactsheet.mjs --comp=MovieHorizontalSilent --set=fast --cols=10 --scale=0.18
 *   node scripts/make-contactsheet.mjs --frames=210,225,240 --tag=check --cols=2 --scale=0.45
 *
 * --set=key   各カットの80%地点 / 着地フレーム / 効果音の山 / 全体の0・25・50・75・100%
 * --set=fast  高速の連続カットを1コマずつ
 * --set=all   その両方
 * --frames    好きなフレームだけ（カンマ区切り）
 *
 * 一覧画像は Remotion 自身で組む。**ffmpeg が入っていなくても作れる。**
 */
import {registerHooks} from 'node:module';
import {bundle} from '@remotion/bundler';
import {getCompositions, selectComposition, renderStill, openBrowser} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

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

const {CUTS, SFX} = await import('../src/config/timeline.ts');
const {DURATION, FPS} = await import('../src/config/theme.ts');

const arg = (k, d) => {
  const hit = process.argv.find((a) => a.startsWith(`--${k}=`));
  return hit ? hit.split('=')[1] : d;
};

const compId = arg('comp', 'MovieVerticalSilent');
const set = arg('set', 'key');
const cols = Number(arg('cols', '6'));
const scale = Number(arg('scale', '0.3'));
const tag = arg('tag', set);

const uniqSorted = (xs) => [...new Set(xs)].filter((f) => f >= 0 && f < DURATION).sort((a, b) => a - b);

const keyFrames = uniqSorted([
  0,
  Math.round(DURATION * 0.25),
  Math.round(DURATION * 0.5),
  Math.round(DURATION * 0.75),
  DURATION - 1,
  ...CUTS.map((c) => c.from + Math.round(c.durationInFrames * 0.8)),
  ...CUTS.map((c) => c.from + c.land),
  ...SFX.filter((s) => s.kind !== 'tick').map((s) => s.at),
]);

// 高速の連続カット（0.5秒＝15フレーム以下のカット）は1コマずつ見る
const fastCuts = CUTS.filter((c) => c.durationInFrames <= 15 && !c.id.startsWith('hold'));
const fastFrames = uniqSorted(
  fastCuts.flatMap((c) => Array.from({length: c.durationInFrames}, (_, i) => c.from + i))
);

const explicit = arg('frames', '');
const frames = explicit
  ? uniqSorted(explicit.split(',').map(Number))
  : set === 'fast'
    ? fastFrames
    : set === 'all'
      ? uniqSorted([...keyFrames, ...fastFrames])
      : keyFrames;

console.log(`コンポジション: ${compId} / ${frames.length} 枚 / scale=${scale}`);

const tilesRel = path.posix.join('.sheet', `${compId}-${tag}`);
const tilesDir = path.resolve('public', tilesRel);
const outDir = path.resolve('output/stills', `${compId}-${tag}`);
for (const d of [tilesDir, outDir]) {
  fs.rmSync(d, {recursive: true, force: true});
  fs.mkdirSync(d, {recursive: true});
}

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comps = await getCompositions(serveUrl);
const composition = comps.find((c) => c.id === compId);
if (!composition) {
  throw new Error(
    `コンポジションが見つからない: ${compId}\n使えるのは: ${comps.map((c) => c.id).join(', ')}`
  );
}

const browser = await openBrowser('chrome');
const files = [];
const labels = [];
for (let i = 0; i < frames.length; i++) {
  const f = frames[i];
  const name = `t${String(i).padStart(3, '0')}.png`;
  await renderStill({
    composition,
    serveUrl,
    output: path.join(tilesDir, name),
    frame: f,
    imageFormat: 'png',
    scale,
    puppeteerInstance: browser,
  });
  fs.copyFileSync(path.join(tilesDir, name), path.join(outDir, name));
  files.push(path.posix.join(tilesRel, name));
  labels.push(`f${f}  ${(f / FPS).toFixed(2)}s`);
  process.stdout.write(`\r  ${i + 1}/${frames.length}`);
}
console.log('');

const sheet = path.resolve('output/stills', `sheet-${compId}-${tag}.png`);
try {
  const props = {
    files,
    labels,
    cols,
    tileW: Math.round(composition.width * scale),
    tileH: Math.round(composition.height * scale),
  };
  // public/ の中身はバンドルした時点で固定される。
  // コマは今さっき置いたばかりなので、一覧画像を組む前にもう一度バンドルし直す。
  const sheetServeUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
  const sheetComp = await selectComposition({serveUrl: sheetServeUrl, id: 'ContactSheet', inputProps: props});
  await renderStill({
    composition: sheetComp,
    serveUrl: sheetServeUrl,
    output: sheet,
    frame: 0,
    imageFormat: 'png',
    inputProps: props,
    puppeteerInstance: browser,
  });
  console.log(`一覧画像: ${sheet}`);
  console.log(`  ${sheetComp.width}x${sheetComp.height} / ${cols} 列 / 各コマにフレーム番号あり`);
} catch (e) {
  console.log('△ 一覧画像を作れませんでした:', e.message);
  console.log(`  1枚ずつの静止画はここにあります: ${outDir}`);
  console.log('  ' + labels.map((l, i) => `t${String(i).padStart(3, '0')}=${l}`).join(' / '));
} finally {
  await browser.close({silent: true});
  // public/ に置いた作業用のコマは残さない（Remotion の静的ファイルに混ざるため）
  fs.rmSync(path.resolve('public/.sheet'), {recursive: true, force: true});
}
