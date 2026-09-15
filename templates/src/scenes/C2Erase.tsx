import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp} from '../motion';
import {fitSize} from '../motion/fit';
import {useStage} from '../components/useStage';

/**
 * C2 「何が残った？」
 * 本文の文字が1字ずつ下から消え、「？」だけが取り残される。
 * = 「残らなかった」ことを画そのもので言う。
 */
export const C2Erase: React.FC = () => {
  const f = useCurrentFrame();
  const {s, width, padX} = useStage();
  const chars = COPY.c2.body.split('');
  const full = COPY.c2.body + COPY.c2.mark;
  const size = fitSize(full, 172 * s, width - padX * 2);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-start', paddingLeft: padX}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: '-0.03em',
          color: COLOR.ink,
          display: 'flex',
          alignItems: 'flex-end',
          lineHeight: 1.1,
        }}
      >
        {chars.map((c, i) => {
          const start = i * 4;
          const gone = interpolate(f, [start, start + 5], [0, 100], clamp);
          return (
            <span key={i} style={{clipPath: `inset(0% 0% ${gone}% 0%)`, display: 'inline-block'}}>
              {c}
            </span>
          );
        })}
        <span
          style={{
            color: COLOR.accent,
            display: 'inline-block',
            transform: `scale(${interpolate(f, [22, 28], [1, 1.14], clamp)})`,
            transformOrigin: 'left bottom',
          }}
        >
          {COPY.c2.mark}
        </span>
      </div>
    </AbsoluteFill>
  );
};
