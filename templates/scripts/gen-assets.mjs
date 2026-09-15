/**
 * public/assets の中身から src/config/assets.ts を作る。
 * **素材を撮り直したら必ず実行する。**
 *
 * サムネの並びは materials/thumb-order.json（サイト上の並び順）があればそれに従う。
 * 無ければファイル名順。並び順は、グリッドが埋まるときの色の移り変わりを決める。
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const thumbsDir = path.resolve(root, 'public/assets/thumbs');
const uiDir = path.resolve(root, 'public/assets/ui');
const orderFile = path.resolve(root, 'materials/thumb-order.json');
const logoFile = path.resolve(root, 'public/assets/logo-mark.png');

const exists = (p) => fs.existsSync(p);

/** PNG の IHDR から幅・高さを読む（縦横比が分からないと切り抜きの高さを出せない）。 */
const pngSize = (file) => {
  const b = fs.readFileSync(file);
  if (b.subarray(1, 4).toString() !== 'PNG') throw new Error('PNG ではない: ' + file);
  return {w: b.readUInt32BE(16), h: b.readUInt32BE(20)};
};

// ---- サムネ ----
let thumbs = [];
if (exists(thumbsDir)) {
  const onDisk = fs.readdirSync(thumbsDir).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
  const names = onDisk.map((f) => f.replace(/\.\w+$/, ''));
  const extOf = Object.fromEntries(onDisk.map((f) => [f.replace(/\.\w+$/, ''), path.extname(f)]));
  let ordered;
  if (exists(orderFile)) {
    const order = JSON.parse(fs.readFileSync(orderFile, 'utf8'));
    const set = new Set(names);
    ordered = [...order.filter((n) => set.has(n)), ...names.filter((n) => !order.includes(n))];
  } else {
    ordered = names.sort();
  }
  thumbs = ordered.map((n) => ({name: n, ext: extOf[n]}));
}
const thumbExt = thumbs.length ? thumbs[0].ext : '.webp';

// ---- 画面の切り抜き ----
const ui = exists(uiDir)
  ? fs
      .readdirSync(uiDir)
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => ({name: f.replace(/\.\w+$/, ''), ...pngSize(path.join(uiDir, f))}))
  : [];

const logo = exists(logoFile) ? pngSize(logoFile) : {w: 1024, h: 1024};

const key = (n) => (/^[A-Za-z_$][\w$]*$/.test(n) ? n : `'${n}'`);

const lines = [
  '// 自動生成（scripts/gen-assets.mjs）。**手で編集しない。**',
  '// 素材はすべて依頼主のサイト／支給素材から取得。',
  '',
  '/** グリッドに敷き詰めるサムネ。数字カウントの到達値と必ず同数にする。 */',
  'export const THUMBS = [',
  ...thumbs.map((t) => `  '${t.name}',`),
  '] as const;',
  '',
  '/** 画面の切り抜き。w / h は縦横比を出すための実寸（px）。 */',
  'export const UI = {',
  ...ui.map((u) => `  ${key(u.name)}: {src: 'assets/ui/${u.name}.png', w: ${u.w}, h: ${u.h}},`),
  '} as const;',
  '',
  `export const LOGO_MARK = {src: 'assets/logo-mark.png', w: ${logo.w}, h: ${logo.h}};`,
  "export const CHARACTER = 'assets/character.png';",
  'export const thumbPath = (name: string) => `assets/thumbs/${name}' + thumbExt + '`;',
  '',
];

fs.writeFileSync(path.resolve(root, 'src/config/assets.ts'), lines.join('\n'));
console.log(`src/config/assets.ts を生成: サムネ ${thumbs.length} 点 / 画面 ${ui.length} 点`);
for (const u of ui) console.log(`  ${u.name}  ${u.w}x${u.h}`);
if (!ui.length) console.log('  （画面の切り抜きが0点。capture-site.mjs を先に走らせる）');
