/**
 * ブランドトークン。
 *
 * ★ 色は **サイトの CSS 変数から拾った実物**で上書きすること（下見の report.json に入っている）。
 *   下の値は、拾えなかったときのための落としどころ（暗い背景＋クリームの文字＋暖色のアクセント）。
 *   ここが実物とズレると、画面の切り抜きだけ色が浮いて全カットが破綻する。
 */
export const FPS = 30;
export const BPM = 120;
/** 1拍 = 15 フレーム。全タイミングはこの目盛りから計算する。 */
export const BEAT = (FPS * 60) / BPM;
export const BAR = BEAT * 4;
/** 全尺（フレーム）。15秒=450 / 30秒=900 / 60秒=1800。 */
export const DURATION = 450;

export const COLOR = {
  bg: '#12181f',
  bgDeep: '#0a0f14',
  surface: '#1a232c',
  surface2: '#1f2933',
  line: '#2a3641',
  line2: '#3a4854',
  ink: '#f0e8dc',
  ink2: '#b3bec6',
  ink3: '#8d99a3',
  accent: '#e98949',
  accentDeep: '#e16a1b',
  accentInk: '#0e1b21',
  cyan: '#8ac4d4',
} as const;

export const FONT = '"Noto Sans JP", system-ui, sans-serif';

/**
 * 文字の3階層（縦 1080x1920 基準。横は useStage().s で拡大）。
 * 実際のサイズは motion/fit.ts の fitSize() が幅に合わせて縮めるので、ここは上限。
 */
export const TYPE = {
  hero: {weight: 900, size: 172, tracking: -0.03, line: 1.12},
  sub: {weight: 700, size: 88, tracking: 0.0, line: 1.3},
  note: {weight: 500, size: 40, tracking: 0.18, line: 1.4},
} as const;
