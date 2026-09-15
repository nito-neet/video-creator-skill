import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {slam, impactShift} from '../motion';
import {fitSize, fitSizeScaled} from '../motion/fit';
import {cut} from '../config/timeline';
import {useStage} from '../components/useStage';
import {GhostWord} from '../components/primitives';

const PEAK = 1.35;

/** C1 断言を叩きつける。視聴者の自分事から入る。 */
export const C1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const {s, width, height, padX} = useStage();
  const land = cut('c1').land;
  const scale = slam(f, 0, land, PEAK);
  const shift = impactShift(f, land, 5 * s);
  const safe = width - padX * 2;

  const leadSize = fitSize(COPY.c1.lead, 92 * s, safe);
  const heroSize = fitSizeScaled(COPY.c1.hero, 200 * s, safe, PEAK);

  return (
    <AbsoluteFill style={{transform: `translateY(${shift}px)`}}>
      <GhostWord text="LEARN" size={520 * s} opacity={0.06} top="50%" left="50%" />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 6 * s,
          paddingBottom: height * 0.05,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: leadSize,
            letterSpacing: '0.06em',
            color: COLOR.ink2,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.c1.lead}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: heroSize,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            color: COLOR.ink,
            transform: `scale(${scale})`,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.c1.hero}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
