/**
 * 動く環境がそろっているかを確かめる。**何かを作り始める前に必ず1回走らせる。**
 *
 *   node scripts/doctor.mjs
 *
 * 足りないものがあれば、どうすれば揃うかまで出す。
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rows = [];
const ok = (name, detail) => rows.push({level: 'ok', name, detail});
const warn = (name, detail, how) => rows.push({level: 'warn', name, detail, how});
const ng = (name, detail, how) => rows.push({level: 'ng', name, detail, how});

// ---------- Node ----------
const [maj, min] = process.versions.node.split('.').map(Number);
const nodeOk = maj > 22 || (maj === 22 && min >= 18);
if (nodeOk) {
  ok('Node.js', `v${process.versions.node}`);
} else {
  ng(
    'Node.js',
    `v${process.versions.node}（TypeScript をそのまま読む機能が要るので v22.18 以上が必要）`,
    'https://nodejs.org/ から最新の LTS を入れ直す'
  );
}

// ---------- npm ----------
// 呼び名が環境で違う（npm / npm.cmd）ので順に試す。
// どれも通らなくても、node_modules があるなら実際には使えているので警告どまりにする。
const npmVersion = (() => {
  for (const bin of process.platform === 'win32' ? ['npm.cmd', 'npm'] : ['npm']) {
    try {
      return execFileSync(bin, ['-v'], {stdio: 'pipe'}).toString().trim();
    } catch {
      /* 次の呼び名を試す */
    }
  }
  return null;
})();
if (npmVersion) ok('npm', `v${npmVersion}`);
else warn('npm', 'このシェルからは確認できなかった', 'npm install が通っているなら気にしなくてよい');

// ---------- ffmpeg ----------
// Remotion が自前の ffmpeg を同梱しているので、入れていなくても書き出しと検証はできる。
// システムの ffmpeg があると、自分で細かい加工をしたいときに便利というだけ。
try {
  const {findFfmpeg} = await import('./find-ffmpeg.mjs');
  const f = findFfmpeg();
  if (f) ok('ffmpeg', f.bundled ? 'Remotion 同梱のものを使う（別途インストール不要）' : 'システムのものを使う');
  else warn('ffmpeg', 'まだ見つからない', 'npm install を先に通す');
} catch {
  warn('ffmpeg', 'まだ確認できない', 'npm install を先に通す');
}

// ---------- ブラウザ（サイトから素材を撮るときだけ必要） ----------
try {
  const {findChrome} = await import('./find-chrome.mjs');
  ok('ブラウザ', findChrome({quiet: true}));
} catch (e) {
  warn('ブラウザ', '見つからない（サイトから素材を撮るときだけ必要）', 'npx playwright install chromium');
}

// ---------- 依存パッケージ ----------
const root = process.cwd();
if (fs.existsSync(path.join(root, 'node_modules/remotion'))) {
  ok('依存パッケージ', 'インストール済み');
} else {
  ng('依存パッケージ', 'まだ入っていない', 'npm install');
}

// ---------- 音源 ----------
// 書き出し時に自動で作られるが、無いまま render すると 404 で止まるので見ておく
if (fs.existsSync(path.join(root, 'public/audio/track.wav'))) {
  ok('音源', '作成済み');
} else {
  warn('音源', 'まだ作っていない', 'npm run audio（書き出し時に自動でも作られる）');
}

// ---------- 素材 ----------
const uiDir = path.join(root, 'public/assets/ui');
const thumbDir = path.join(root, 'public/assets/thumbs');
const uiN = fs.existsSync(uiDir) ? fs.readdirSync(uiDir).filter((f) => f.endsWith('.png')).length : 0;
const thN = fs.existsSync(thumbDir) ? fs.readdirSync(thumbDir).length : 0;
ok('素材', `画面 ${uiN} 点 / サムネ ${thN} 点${uiN <= 9 && thN <= 12 ? '（まだ雛形のダミー）' : ''}`);

// ---------- 表示 ----------
const mark = {ok: '○', warn: '△', ng: '×'};
/** 全角は2文字ぶんとして数え、見出しの幅をそろえる。 */
const padTo = (s, w) => {
  const width = [...s].reduce((a, c) => a + (c.charCodeAt(0) > 0xff ? 2 : 1), 0);
  return s + ' '.repeat(Math.max(0, w - width));
};
console.log('');
console.log('  環境チェック');
console.log('  ' + '─'.repeat(64));
for (const r of rows) {
  console.log(`  ${mark[r.level]} ${padTo(r.name, 16)}${r.detail}`);
  if (r.how) console.log(`      → ${r.how}`);
}
console.log('  ' + '─'.repeat(64));

const bad = rows.filter((r) => r.level === 'ng');
if (bad.length) {
  console.log(`  ${bad.length} 件足りません。上の「→」のとおりに用意してから進んでください。`);
  process.exitCode = 1;
} else {
  const w = rows.filter((r) => r.level === 'warn');
  console.log(w.length ? '  作れます（△ はサイトから素材を撮るときだけ必要）。' : '  すべてそろっています。');
}
console.log('');
console.log('  ※ この雛形は Remotion を使っています。個人・少人数の会社は無料ですが、');
console.log('     従業員が一定数を超える会社は有償ライセンスが要ります（https://remotion.dev/license）。');
console.log('');
