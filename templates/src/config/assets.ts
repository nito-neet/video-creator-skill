// 自動生成（scripts/gen-assets.mjs）。**手で編集しない。**
// これは素材をまだ1枚も撮っていないときの雛形。
// `node scripts/capture-site.mjs` → `node scripts/gen-assets.mjs` を回すと、
// public/assets の中身から実物の一覧に置き換わる。

/** グリッドに敷き詰めるサムネ。数字カウントの到達値と必ず同数にする。 */
export const THUMBS = [] as const;

/**
 * 画面の切り抜き。w / h は縦横比を出すための実寸（px）。
 * キー名は capture.config.mjs の shots[].name と一致する。
 */
export const UI = {
  home: {src: 'assets/ui/home.png', w: 2880, h: 1800},
  'proof-a': {src: 'assets/ui/proof-a.png', w: 1680, h: 536},
  'proof-b': {src: 'assets/ui/proof-b.png', w: 1620, h: 384},
  'proof-c': {src: 'assets/ui/proof-c.png', w: 2356, h: 600},
  'stage-1': {src: 'assets/ui/stage-1.png', w: 1040, h: 182},
  'stage-2': {src: 'assets/ui/stage-2.png', w: 1040, h: 232},
  'stage-3': {src: 'assets/ui/stage-3.png', w: 1040, h: 232},
  'stage-4': {src: 'assets/ui/stage-4.png', w: 1040, h: 232},
  widget: {src: 'assets/ui/widget.png', w: 430, h: 262},
} as const;

export const LOGO_MARK = {src: 'assets/logo-mark.png', w: 1024, h: 1024};
export const CHARACTER = 'assets/character.png';
export const thumbPath = (name: string) => `assets/thumbs/${name}.webp`;
