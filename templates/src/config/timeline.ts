import {BEAT, DURATION} from './theme';
import {THUMBS} from './assets';
import {COPY} from './copy';

/**
 * すべてのタイミングの唯一の出所。
 * コンポーネント側にフレーム数を直接書かない（散らすと縦横でズレる）。
 * b(n) = n拍目のフレーム。1拍 = 15f。
 *
 * 下の def の表だけ書き換えれば、カットの長さ・順番が変わる。
 * 開始拍と長さ(拍)で書くので、15f の倍数（＝拍）から外れることがない。
 */
export const b = (n: number) => Math.round(n * BEAT);

export type CutId =
  | 'c1' | 'c2' | 'hold1' | 'c4' | 'c5' | 'c6' | 'c7'
  | 'c8' | 'c9' | 'c10' | 'c11' | 'hold2' | 'c13' | 'cta';

export type Cut = {
  id: CutId;
  from: number;
  durationInFrames: number;
  /** 見せ場（動きが着地する）フレーム。カット先頭からの相対値。 */
  land: number;
};

const def: Array<[CutId, number, number, number]> = [
  // id,      開始拍, 長さ(拍), 着地(f, 相対)
  ['c1',      0,   2,   6],   // フック（叩きつけ）
  ['c2',      2,   2,   0],   // 痛点（文字が消える）
  ['hold1',   4,   1,   0],   // 間
  ['c4',      5,   2,   6],   // 言い切り（上書きスタンプ）
  ['c5',      7,   2,   7],   // ロゴ（実物）＋字間収束
  ['c6',      9,   2,   8],   // サービスの全景（画面が奥から迫る）
  ['c7',     11,   4,  48],   // 数字＋実物の枚数が同期 ★最強点
  ['c8',     15,   1,   0],   // ベネフィット1＋裏づけの画面
  ['c9',     16,   1,   0],   // ベネフィット2＋裏づけの画面
  ['c10',    17,   1,   0],   // ベネフィット3（3連で最大）
  ['c11',    18,   2,  18],   // 段階・階層（実物が積み上がる）
  ['hold2',  20,   1,   0],   // 間
  ['c13',    21,   3,  10],   // 最初の一歩（文字が中央に収束）
  ['cta',    24,   6,  15],   // CTA
];

export const CUTS: Cut[] = def.map(([id, fromBeat, beats, land]) => ({
  id,
  from: b(fromBeat),
  durationInFrames: b(fromBeat + beats) - b(fromBeat),
  land,
}));

export const cut = (id: CutId): Cut => {
  const c = CUTS.find((x) => x.id === id);
  if (!c) throw new Error(`unknown cut: ${id}`);
  return c;
};

/** 絶対フレームでの着地点（効果音の位置計算に使う）。 */
export const landOf = (id: CutId) => cut(id).from + cut(id).land;

if (CUTS[CUTS.length - 1].from + CUTS[CUTS.length - 1].durationInFrames !== DURATION) {
  throw new Error('timeline の合計が DURATION と一致しない');
}

/**
 * c7：サムネが1枚ずつ埋まる区間（カット先頭からの相対フレーム）。カウンターもこれに同期する。
 * 枚数は素材の実数。素材が無いプロジェクトでは、ただのカウントアップとして動く。
 */
export const GRID = {start: 5, perTile: 1, count: THUMBS.length || COPY.c7.value};

// 画と数字がズレたまま書き出す事故を、起動時に落として防ぐ。
// number に落としてから比べる（リテラル型のままだと、分かりにくい型エラーで止まってしまう）
const thumbCount: number = THUMBS.length;
const countTarget: number = COPY.c7.value;
if (thumbCount > 0 && thumbCount !== countTarget) {
  throw new Error(
    `サムネの枚数(${thumbCount})と C7 の数字(${countTarget})が一致しない。` +
      'src/config/copy.ts の c7.value を直すか、サムネを撮り直すこと。' +
      '数字と実物の枚数が合っていないと、この演出は意味を失う。'
  );
}

export const gridFilled = (rel: number) =>
  Math.max(0, Math.min(GRID.count, Math.floor((rel - GRID.start) / GRID.perTile)));

/** 効果音の「山」を置く絶対フレーム。音声合成スクリプトと映像が同じ表を読む。 */
export type SfxKind =
  | 'impact' | 'sweepDown' | 'vanish' | 'subHit' | 'swipe'
  | 'tick' | 'bigHit' | 'whoosh' | 'click' | 'swell' | 'finalHit';
export type Sfx = {at: number; kind: SfxKind; gain?: number};

/** サムネが埋まる間のティック。1枚ごとだと細かすぎるので4枚ごとに鳴らす。 */
const ticks: Sfx[] = Array.from({length: 10}, (_, i) => ({
  at: cut('c7').from + GRID.start + i * 4 * GRID.perTile,
  kind: 'tick' as const,
  gain: 0.26 + i * 0.018,
}));

export const SFX: Sfx[] = [
  {at: landOf('c1'), kind: 'impact', gain: 0.9},
  {at: cut('c2').from, kind: 'sweepDown', gain: 0.5},
  {at: cut('c2').from + 22, kind: 'vanish', gain: 0.4},
  {at: landOf('c4'), kind: 'subHit', gain: 0.85},
  {at: landOf('c4'), kind: 'impact', gain: 0.7},
  {at: landOf('c5'), kind: 'impact', gain: 0.65},
  {at: cut('c6').from, kind: 'whoosh', gain: 0.55},
  {at: landOf('c6'), kind: 'subHit', gain: 0.5},
  ...ticks,
  {at: landOf('c7'), kind: 'bigHit', gain: 1.0},
  {at: cut('c8').from, kind: 'whoosh', gain: 0.6},
  {at: cut('c9').from, kind: 'whoosh', gain: 0.6},
  {at: cut('c10').from, kind: 'whoosh', gain: 0.8},
  ...[0, 6, 12, 18].map((d) => ({at: cut('c11').from + d, kind: 'click' as const, gain: 0.38})),
  {at: cut('c13').from, kind: 'swell', gain: 0.55},
  {at: landOf('c13'), kind: 'swipe', gain: 0.35},
  {at: cut('cta').from, kind: 'finalHit', gain: 0.95},
];

/** ドラムを止める「間」の区間（映像も静止する）。 */
export const HOLDS: Array<[number, number]> = [
  [cut('hold1').from, cut('hold1').from + cut('hold1').durationInFrames],
  [cut('hold2').from, cut('hold2').from + cut('hold2').durationInFrames],
];
