import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, OUT} from '../motion';
import {fitSize} from '../motion/fit';
import {cut} from '../config/timeline';
import {useStage} from '../components/useStage';
import {Screen} from '../components/Screen';

/**
 * C6 サービスの全景。ここで初めて「実物の画面」を見せる。
 * 奥から手前へ迫り、わずかに傾いた状態から正面に起き上がる（＝出てくる）。
 * 次のカット（42コース）への前振りなので、文言は短く置くだけにする。
 */
export const C6Home: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, height, padX} = useStage();
  const land = cut('c6').land;

  const scale = interpolate(f, [0, land], [1.28, 1], {...clamp, easing: OUT});
  const rot = interpolate(f, [0, land], [-7, vertical ? -2.5 : -1.5], {...clamp, easing: OUT});
  const y = interpolate(f, [0, land], [height * 0.16, 0], {...clamp, easing: OUT});
  const o = fade(f, -3, 5);

  const shotW = vertical ? width * 1.0 : width * 0.5;
  // 横は左右に並べるので、文字に使えるのは安全域の 4 割強しかない
  const textBox = vertical ? width - padX * 2 : (width - padX * 2) * 0.42;
  const heroSize = fitSize(COPY.c6.hero, (vertical ? 132 : 120) * s, textBox);

  const Text = (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: heroSize,
        color: COLOR.ink,
        letterSpacing: '-0.03em',
        whiteSpace: 'nowrap',
        opacity: fade(f, land + 2, 7),
        transform: `translateY(${interpolate(f, [land + 2, land + 9], [22 * s, 0], clamp)}px)`,
        textShadow: `0 0 ${70 * s}px ${COLOR.bg}`,
      }}
    >
      {COPY.c6.hero}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? 'column' : 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 46 * s : width * 0.04,
      }}
    >
      <div
        style={{
          opacity: o,
          transform: `translateY(${y}px) scale(${scale}) rotate(${rot}deg)`,
          transformOrigin: 'center',
        }}
      >
        <Screen name="home" width={shotW} radius={20 * s} />
      </div>
      {Text}
    </AbsoluteFill>
  );
};
