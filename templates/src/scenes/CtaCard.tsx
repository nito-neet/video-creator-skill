import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, slam} from '../motion';
import {fitSize, fitSizeScaled} from '../motion/fit';
import {useStage} from '../components/useStage';
import {LogoMark, Screen} from '../components/Screen';

const PEAK = 1.4;

/**
 * C14 エンドカード。
 * 0–14f で組み上がり、14–76f（約2.1秒）は完全静止して読ませる。
 * 76–90f でボタンの縁が 1 回だけ淡く光る（明滅にならない緩やかな動き）。
 * 背景にはホーム画面を不透明度 6% で敷いて、最後までサイトの気配を残す。
 */
export const CtaCard: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, padX} = useStage();
  const safe = vertical ? width - padX * 2 : (width - padX * 2) * 0.46;

  const wordSize = fitSizeScaled(COPY.cta.word, 190 * s, safe, PEAK);
  const noteSize = fitSize(COPY.cta.note, 38 * s, safe);
  const btnPadX = 58 * s;
  const btnSize = fitSize(COPY.cta.button, 84 * s, safe - btnPadX * 2);
  const urlSize = fitSize(COPY.cta.url, 46 * s, safe);
  const markSize = (vertical ? 190 : 170) * s;

  const logoScale = slam(f, 0, 8, PEAK);
  const btnY = interpolate(f, [8, 14], [70 * s, 0], clamp);
  const glow = interpolate(f, [76, 83, 90], [0, 0.25, 0], clamp);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 0.032}}>
        <Screen name="home" width={width * (vertical ? 2.0 : 1.35)} border={false} shadow={false} radius={0} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? 78 * s : width * 0.08,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * s}}>
          <LogoMark size={markSize} style={{transform: `scale(${logoScale})`, marginBottom: 6 * s}} />
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: wordSize,
              color: COLOR.ink,
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              opacity: fade(f, 4, 6),
            }}
          >
            {COPY.cta.word}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: noteSize,
              color: COLOR.ink3,
              letterSpacing: '0.22em',
              marginRight: '-0.22em',
              opacity: fade(f, 6, 8),
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta.note}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 30 * s,
            transform: `translateY(${btnY}px)`,
            opacity: fade(f, 8, 6),
          }}
        >
          <div
            style={{
              position: 'relative',
              background: COLOR.accent,
              color: COLOR.accentInk,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: btnSize,
              letterSpacing: '0.01em',
              padding: `${32 * s}px ${btnPadX}px`,
              borderRadius: 999,
              whiteSpace: 'nowrap',
            }}
          >
            {COPY.cta.button}
            <div
              style={{
                position: 'absolute',
                inset: -8 * s,
                borderRadius: 999,
                border: `${5 * s}px solid ${COLOR.ink}`,
                opacity: glow,
              }}
            />
          </div>
          <div style={{fontFamily: FONT, fontWeight: 700, fontSize: urlSize, color: COLOR.ink2, letterSpacing: '0.06em'}}>
            {COPY.cta.url}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
