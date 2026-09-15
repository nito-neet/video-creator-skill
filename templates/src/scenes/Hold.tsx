import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp} from '../motion';
import {fitSize} from '../motion/fit';
import {useStage} from '../components/useStage';
import {Screen, UiKey} from '../components/Screen';

/**
 * 【間】画面と音を止める。直後に大きな切り替えが来るための落差を作る。
 * 残すのは直前のカットの痕跡だけ。動かさない。
 */
export const Hold: React.FC<{remnant?: boolean; panels?: boolean}> = ({remnant, panels}) => {
  const f = useCurrentFrame();
  const {s, padX, width, vertical} = useStage();
  const o = interpolate(f, [0, 10], [0.14, 0], clamp);

  // C2 の「？」が居た位置にそのまま残す（間の直前の画をそのまま引き継ぐ）
  const size = fitSize(COPY.c2.body + COPY.c2.mark, 172 * s, width - padX * 2);
  const markX = padX + size * 0.99 * COPY.c2.body.length;

  return (
    <AbsoluteFill>
      {remnant ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-start', paddingLeft: markX}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              color: COLOR.accent,
              opacity: o,
              lineHeight: 1.1,
            }}
          >
            {COPY.c2.mark}
          </div>
        </AbsoluteFill>
      ) : null}
      {panels ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 14 * s, opacity: 0.16}}>
            {COPY.c11.stages.map((name) => (
              <Screen key={name} name={name as UiKey} width={vertical ? width - padX * 2 : (width - padX * 2) * 0.72} radius={12 * s} shadow={false} border={false} />
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
