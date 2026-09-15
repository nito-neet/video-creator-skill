import {Easing, interpolate} from 'remotion';

const OUT = Easing.bezier(0.16, 1, 0.3, 1); // 速く出て、ぴたりと止まる
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * 叩きつけ。1.8倍 → 0.92（行き過ぎ）→ 1.00 で着地。
 * 柔らかいバウンスではなく、一度だけ潰して止める。
 */
export const slam = (frame: number, start = 0, dur = 6, from = 1.8) =>
  interpolate(
    frame,
    [start, start + dur * 0.62, start + dur],
    [from, 0.92, 1],
    {...clamp, easing: OUT}
  );

/** 叩きつけ着地の衝撃で画面全体が沈む量（px）。着地から3fで戻る。 */
export const impactShift = (frame: number, land: number, px = 4) =>
  interpolate(frame, [land - 1, land, land + 3], [0, px, 0], clamp);

/** スライド。distance px の位置から 0 へ。 */
export const slideIn = (frame: number, start = 0, dur = 8, distance = 300) =>
  interpolate(frame, [start, start + dur], [distance, 0], {...clamp, easing: OUT});

/** マスクで出す。clip-path: inset(...) に渡す 0〜50 の値を返す。 */
export const wipe = (
  frame: number,
  start: number,
  dur: number,
  dir: 'up' | 'down' | 'left' | 'right' | 'center'
) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {...clamp, easing: OUT});
  const v = (1 - p) * 100;
  switch (dir) {
    case 'up': return `inset(${v}% 0% 0% 0%)`;
    case 'down': return `inset(0% 0% ${v}% 0%)`;
    case 'left': return `inset(0% ${v}% 0% 0%)`;
    case 'right': return `inset(0% 0% 0% ${v}%)`;
    case 'center': return `inset(0% ${v / 2}% 0% ${v / 2}%)`;
  }
};

/** 字間の開閉。集まる／広がるの表現に使う。 */
export const tracking = (
  frame: number,
  start: number,
  dur: number,
  fromPx: number,
  toPx: number
) => interpolate(frame, [start, start + dur], [fromPx, toPx], {...clamp, easing: OUT});

/** カウンター。段数で刻んで回し、最後に目標値で確定する。 */
export const counter = (
  frame: number,
  start: number,
  dur: number,
  target: number,
  steps = 10
) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], clamp);
  if (p >= 1) return target;
  const stepped = Math.floor(p * steps) / steps;
  // 最後の一歩手前までは実値より少し手前を通す（確定の瞬間を作るため）
  return Math.round(stepped * target);
};

/** フェード。 */
export const fade = (frame: number, start: number, dur: number, from = 0, to = 1) =>
  interpolate(frame, [start, start + dur], [from, to], {...clamp, easing: IN_OUT});

/** n 番目の要素の遅延（時差）。 */
export const stagger = (i: number, per: number) => i * per;

/** 残像の枚数分のオフセットを返す。 */
export const ghosts = (count: number) =>
  Array.from({length: count}, (_, i) => ({
    i: i + 1,
    opacity: [0.35, 0.2, 0.1][i] ?? 0.08,
  }));

export {OUT, IN_OUT};
