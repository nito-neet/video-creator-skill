import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {COLOR} from '../config/theme';
import {clamp} from '../motion';
import {cut, HOLDS} from '../config/timeline';
import {useStage} from './useStage';

/** 「間」の区間では動きを止めるため、その区間の開始フレームで固定する。 */
export const freeze = (frame: number) => {
  for (const [from, to] of HOLDS) {
    if (frame >= from && frame < to) return from;
  }
  return frame;
};

/**
 * 背景の基準色。切り替えは 6 回、最短間隔 2.0 秒。
 * 1秒に3回以上の明滅が起きないよう、ここ1か所でのみ色を動かす。
 */
const baseColor = (f: number) =>
  interpolateColors(
    f,
    [0, 30, 60, 75, 79, 300, 304, 315, 327, 450],
    [
      COLOR.bg, COLOR.bg, COLOR.bgDeep, COLOR.bgDeep, COLOR.bg,
      COLOR.bg, COLOR.bgDeep, COLOR.bgDeep, COLOR.bg, COLOR.bg,
    ]
  );

const Stars: React.FC = () => {
  const frame = freeze(useCurrentFrame());
  const {width, height} = useStage();
  const dots = React.useMemo(
    () =>
      Array.from({length: 46}, (_, i) => ({
        x: random(`x${i}`),
        y: random(`y${i}`),
        r: 1.5 + random(`r${i}`) * 3.5,
        sp: 0.15 + random(`s${i}`) * 0.5,
        ph: random(`p${i}`) * 100,
      })),
    []
  );
  return (
    <AbsoluteFill>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x * width,
            top: ((d.y * height - frame * d.sp * 6) % height + height) % height,
            width: d.r,
            height: d.r,
            borderRadius: '50%',
            background: i % 5 === 0 ? COLOR.accent : COLOR.cyan,
            opacity: 0.1 + 0.12 * Math.abs(Math.sin((frame + d.ph) / 40)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** 高速4連カット（C7–C10）の下に固定で敷く帯。背景全体の輝度を動かさないための装置。 */
const Band: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useStage();
  const from = cut('c8').from;
  const to = cut('c10').from + cut('c10').durationInFrames;
  if (frame < from || frame >= to) return null;
  const color = frame < cut('c10').from ? COLOR.accentDeep : COLOR.accent;
  const grow = interpolate(frame, [from, from + 5], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.09 * grow,
        background: color,
        opacity: 0.92,
      }}
    />
  );
};

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: baseColor(frame)}}>
      <Stars />
      <Band />
    </AbsoluteFill>
  );
};
