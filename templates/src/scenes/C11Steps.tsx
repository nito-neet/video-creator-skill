import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, stagger, wipe} from '../motion';
import {fitSize} from '../motion/fit';
import {useStage} from '../components/useStage';
import {Screen, UiKey} from '../components/Screen';

/**
 * C11 「段階」を積層で言う。
 * v2 では抽象的なパネルではなく、サイトの実物のフェーズ見出し4枚
 * （自分を定義し、点を打つ／知性の基礎を再構築する／エージェントを指揮する／最高傑作をこの手でつくる）
 * が 6 フレームずつの時差で下から積み上がる。
 * 見出しは 0f から出す（1.0秒しかないカットで前半が空になるのを避ける）。
 */
export const C11Steps: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, height, padX} = useStage();
  const safe = width - padX * 2;

  const titleBox = vertical ? safe : safe * 0.62;
  const numSize = fitSize(COPY.c11.num, 150 * s, titleBox * 0.22);
  const titleSize = fitSize(COPY.c11.title, 120 * s, titleBox - numSize * 0.62);
  const rowW = vertical ? safe : safe * 0.46;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: vertical ? height * 0.035 : height * 0.03,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6 * s,
          clipPath: wipe(f, -2, 7, 'left'),
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: numSize, color: COLOR.accent, letterSpacing: '-0.04em'}}>
          {COPY.c11.num}
        </span>
        <span style={{fontFamily: FONT, fontWeight: 900, fontSize: titleSize, color: COLOR.ink, letterSpacing: '-0.02em'}}>
          {COPY.c11.title}
        </span>
      </div>

      <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 14 * s}}>
        {COPY.c11.stages.map((name, i) => {
          const t = stagger(i, 6);
          const y = interpolate(f, [t, t + 7], [56 * s, 0], clamp);
          const last = i === COPY.c11.stages.length - 1;
          return (
            <div
              key={name}
              style={{
                transform: `translateY(${y}px)`,
                opacity: fade(f, t - 2, 6),
                borderRadius: 12 * s,
                outline: last ? `3px solid ${COLOR.accent}` : 'none',
                outlineOffset: -1,
              }}
            >
              <Screen name={name as UiKey} width={rowW} radius={12 * s} shadow={false} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
