import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {clamp, fade, impactShift, slam, slideIn} from '../motion';
import {fitSizeScaled} from '../motion/fit';
import {cut, gridFilled} from '../config/timeline';
import {useStage} from '../components/useStage';
import {ThumbGrid} from '../components/ThumbGrid';

const PEAK = 1.45;

/**
 * C7 本編の最強点。
 * v2 では数字を単独で回さず、コースサムネ 42 枚が 1 枚ずつ埋まっていく横で
 * 同じ数を数える。数字が 1 増える＝コースが 1 枚増える、が画で一致する。
 * 埋まり切った瞬間にグリッドを沈めて、42 を叩きつける。
 */
export const C7Number: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, height} = useStage();
  const land = cut('c7').land;

  const value = gridFilled(f);
  const confirmed = f >= land;

  const cols = vertical ? 6 : 11;
  const gap = vertical ? 10 : 9;
  const sideMargin = vertical ? width * 0.04 : width * 0.07;
  const tileW = (width - sideMargin * 2 - gap * (cols - 1)) / cols;

  const gridEnter = interpolate(f, [0, 6], [0.9, 1], {...clamp});
  const gridDim = confirmed
    ? interpolate(f, [land, land + 6], [1, 0.3], clamp)
    : fade(f, -4, 5, 0, 1);

  const numSize = fitSizeScaled(String(COPY.c7.value), vertical ? 560 : 470, width * 0.97, PEAK);
  const countSize = numSize * 0.36;
  const numScale = confirmed ? slam(f, land, 7, PEAK) : 1;
  const shift = impactShift(f, land, 8 * s);
  const flash = interpolate(f, [land, land + 1, land + 2], [0, 0.5, 0], clamp);

  return (
    <AbsoluteFill style={{transform: `translateY(${shift}px)`}}>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${gridEnter})`}}>
          <ThumbGrid rel={f} cols={cols} tileW={tileW} gap={gap} dim={gridDim} />
        </div>
      </AbsoluteFill>

      {/* 数え上げ中：グリッドの上に中くらいの数字を置く */}
      {!confirmed ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: height * (vertical ? 0.14 : 0.1)}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: countSize,
              lineHeight: 1,
              color: COLOR.cyan,
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum" 1',
              letterSpacing: '-0.04em',
              textShadow: `0 0 ${50 * s}px ${COLOR.bg}, 0 0 ${18 * s}px ${COLOR.bg}`,
            }}
          >
            {value}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 確定：グリッドを沈めて巨大な 42 を叩きつける */}
      {confirmed ? (
        <AbsoluteFill
          style={{
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: vertical ? 24 * s : width * 0.04,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: numSize,
              lineHeight: 0.82,
              letterSpacing: '-0.06em',
              fontVariantNumeric: 'tabular-nums',
              fontFeatureSettings: '"tnum" 1',
              color: COLOR.accent,
              transform: `scale(${numScale})`,
            }}
          >
            {COPY.c7.value}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: vertical ? 'center' : 'flex-start',
              gap: 12 * s,
              transform: `translateX(${slideIn(f, land, 8, 260 * s)}px)`,
              opacity: fade(f, land + 1, 5),
            }}
          >
            <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 100 * s, color: COLOR.ink, letterSpacing: '0.02em'}}>
              {COPY.c7.unit}
            </div>
            <div style={{fontFamily: FONT, fontWeight: 500, fontSize: 42 * s, color: COLOR.ink3, letterSpacing: '0.14em'}}>
              {COPY.c7.note}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {flash > 0 ? <AbsoluteFill style={{background: COLOR.ink, opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};
