import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, OUT} from '../motion';
import {fitSize} from '../motion/fit';
import {cut} from '../config/timeline';
import {useStage} from '../components/useStage';
import {Screen} from '../components/Screen';

/**
 * C13 散った文字が中央に集まる＝現在地を定める。
 * v2 では自作の計測バーをやめ、サイトの実物の進捗ウィジェット（0 ／ 182 STEP）を置く。
 * 「現在地」を言葉で言うより、実際に 0 から始まる画面を見せたほうが早い。
 */
export const C13Locate: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, padX} = useStage();
  const land = cut('c13').land;
  const safe = width - padX * 2;

  const main = COPY.c13.accent + COPY.c13.after;
  const mainSize = fitSize(main, 165 * s, safe);
  const leadSize = fitSize(COPY.c13.lead, 80 * s, safe);

  const parts: Array<{t: string; color: string}> = [
    ...COPY.c13.accent.split('').map((t) => ({t, color: COLOR.cyan})),
    ...COPY.c13.after.split('').map((t) => ({t, color: COLOR.ink})),
  ];

  const widgetW = (vertical ? 540 : 430) * s;
  const widgetY = interpolate(f, [land + 4, land + 14], [46 * s, 0], {...clamp, easing: OUT});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 20 * s}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: leadSize,
          color: COLOR.ink2,
          letterSpacing: '0.04em',
          opacity: fade(f, 10, 8),
        }}
      >
        {COPY.c13.lead}
      </div>

      <div
        style={{
          display: 'flex',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: mainSize,
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
          lineHeight: 1.1,
        }}
      >
        {parts.map((p, i) => {
          const dx = (random(`dx${i}`) - 0.5) * 460 * s;
          const dy = (random(`dy${i}`) - 0.5) * 380 * s;
          const t = interpolate(f, [i * 1.2, i * 1.2 + 10], [1, 0], {...clamp, easing: OUT});
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                color: p.color,
                transform: `translate(${dx * t}px, ${dy * t}px)`,
                opacity: 1 - t * 0.85,
              }}
            >
              {p.t}
            </span>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 26 * s,
          opacity: fade(f, land + 4, 8),
          transform: `translateY(${widgetY}px)`,
        }}
      >
        <Screen name="widget" width={widgetW} radius={16 * s} />
      </div>
    </AbsoluteFill>
  );
};
