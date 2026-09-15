import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, impactShift, slam, wipe} from '../motion';
import {fitSize, fitSizeScaled} from '../motion/fit';
import {cut} from '../config/timeline';
import {useStage} from '../components/useStage';

const PEAK = 1.3;

/**
 * C4 ブランドの核。「読んで終わりに、」の上に「しない。」を叩きつけて上書きする。
 * 否定＝上から潰す動き。縦は上下分割、横は左右分割。
 */
export const C4Stamp: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, height, padX} = useStage();
  const land = cut('c4').land;
  const safe = vertical ? width - padX * 2 : (width - padX * 2) * 0.55;

  const drop = interpolate(f, [0, land], [-280 * s, 0], clamp);
  const scale = slam(f, 0, land, PEAK);
  const shift = impactShift(f, land, 6 * s);
  const shock = interpolate(f, [land, land + 5], [0.85, 0], clamp);
  const shockW = interpolate(f, [land - 1, land + 6], [0, width * 0.95], clamp);

  const leadSize = fitSize(COPY.c4.lead, 88 * s, safe);
  const punchSize = fitSizeScaled(COPY.c4.punch, 210 * s, safe, PEAK);

  return (
    <AbsoluteFill style={{transform: `translateY(${shift}px)`}}>
      <AbsoluteFill
        style={{
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: vertical ? height * 0.015 : width * 0.03,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: leadSize,
            color: COLOR.ink2,
            letterSpacing: '0.02em',
            clipPath: wipe(f, 0, 8, 'left'),
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.c4.lead}
        </div>
        <div
          style={{
            transform: `translateY(${drop}px) scale(${scale})`,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: punchSize,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.c4.punch.split('').map((c, i) => (
            <span key={i} style={{color: i >= COPY.c4.punchAccentFrom ? COLOR.accent : COLOR.ink}}>
              {c}
            </span>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            width: shockW,
            height: 5 * s,
            background: COLOR.accent,
            opacity: shock,
            marginTop: vertical ? height * 0.16 : height * 0.2,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
