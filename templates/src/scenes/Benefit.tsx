import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, OUT, wipe} from '../motion';
import {fitSize} from '../motion/fit';
import {useStage} from '../components/useStage';
import {Screen, UiKey} from '../components/Screen';

/**
 * C8–C10 ベネフィット3連（各0.5秒）。
 * v2 では言葉の横に、その言葉を裏づける実物の画面を置く。
 *   手が、動く。 → STEP 1〜4 と「実践済みにする」
 *   1枚、残る。 → 「このコースを終えると ／ 3か月で鍛えること3つの計画が、1枚残る」
 *   作れる。   → バイブコーディングのコース行
 * 背景は Background 側で固定したまま文字と画面だけ差し替える（明滅を作らないため）。
 */
const LAYOUT = [
  {size: 150, wipeDir: 'up' as const, align: 'flex-start' as const, textY: 0.24, shotY: 0.42, shotW: 0.92},
  {size: 150, wipeDir: 'left' as const, align: 'flex-end' as const, textY: 0.24, shotY: 0.44, shotW: 0.92},
  {size: 190, wipeDir: 'center' as const, align: 'center' as const, textY: 0.21, shotY: 0.44, shotW: 0.95},
];

export const Benefit: React.FC<{index: 0 | 1 | 2}> = ({index}) => {
  const f = useCurrentFrame();
  const {s, padX, width, height, vertical} = useStage();
  const item = COPY.benefits[index];
  const L = LAYOUT[index];

  const text = item.accent + item.rest;
  // 横は文字と画面を左右に並べるので、文字に使えるのは安全域の 4 割強
  const textBox = vertical ? width - padX * 2 : (width - padX * 2) * 0.44;
  const size = fitSize(text, L.size * s, textBox);
  const push = index === 2 ? interpolate(f, [10, 13], [1, 1.05], clamp) : 1;

  const shotW = vertical ? width * L.shotW : width * 0.44;
  const shotX = interpolate(f, [0, 6], [index % 2 === 0 ? 140 * s : -140 * s, 0], {...clamp, easing: OUT});

  const Text = (
    <div style={{clipPath: wipe(f, -2, 7, L.wipeDir), transform: `scale(${push})`}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
          lineHeight: 1.1,
        }}
      >
        <span style={{color: item.tone === 'cyan' ? COLOR.cyan : COLOR.accent}}>{item.accent}</span>
        <span style={{color: COLOR.ink}}>{item.rest}</span>
      </div>
      {item.note ? (
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: fitSize(item.note, 42 * s, textBox),
            color: COLOR.ink3,
            letterSpacing: '0.12em',
            textAlign: 'center',
            marginTop: 14 * s,
            opacity: fade(f, 5, 5),
            whiteSpace: 'nowrap',
          }}
        >
          {item.note}
        </div>
      ) : null}
    </div>
  );

  const Shot = (
    <div style={{transform: `translateX(${shotX}px)`, opacity: fade(f, -2, 5)}}>
      <Screen name={item.ui as UiKey} width={shotW} radius={14 * s} />
    </div>
  );

  if (!vertical) {
    return (
      <AbsoluteFill
        style={{
          flexDirection: index === 1 ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: width * 0.05,
          paddingLeft: padX,
          paddingRight: padX,
          paddingBottom: height * 0.14,
        }}
      >
        {Text}
        {Shot}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{paddingLeft: padX, paddingRight: padX}}>
      <div
        style={{
          position: 'absolute',
          top: height * L.textY,
          left: padX,
          right: padX,
          display: 'flex',
          justifyContent: L.align,
        }}
      >
        {Text}
      </div>
      <div style={{position: 'absolute', top: height * L.shotY, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        {Shot}
      </div>
    </AbsoluteFill>
  );
};
