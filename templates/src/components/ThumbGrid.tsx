import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import {COLOR} from '../config/theme';
import {THUMBS, thumbPath} from '../config/assets';
import {clamp, OUT} from '../motion';
import {GRID} from '../config/timeline';

/**
 * コースサムネ 42 枚のグリッド。カウンターと同じ数だけ埋まっていく。
 * 数字が 1 増えるたびにサムネが 1 枚増えるので、「42コース」が言葉ではなく画で伝わる。
 * 並びはサイト上の順（フェーズ1→4）なので、埋まるにつれて色味が移り変わる。
 */
export const ThumbGrid: React.FC<{
  rel: number;
  cols: number;
  tileW: number;
  gap: number;
  dim: number;
}> = ({rel, cols, tileW, gap, dim}) => {
  const tileH = tileW * (125 / 234); // サイト上のカードと同じ比率
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${tileW}px)`,
        gap,
        opacity: dim,
      }}
    >
      {THUMBS.map((name, i) => {
        const at = GRID.start + i * GRID.perTile;
        const p = interpolate(rel, [at, at + 5], [0, 1], {...clamp, easing: OUT});
        if (p <= 0) {
          return (
            <div
              key={name}
              style={{
                width: tileW,
                height: tileH,
                borderRadius: 8,
                background: COLOR.surface2,
                border: `1px solid ${COLOR.line}`,
                boxSizing: 'border-box',
                opacity: 0.55,
              }}
            />
          );
        }
        return (
          <div
            key={name}
            style={{
              width: tileW,
              height: tileH,
              borderRadius: 8,
              overflow: 'hidden',
              opacity: p,
              transform: `scale(${0.82 + p * 0.18})`,
              lineHeight: 0,
            }}
          >
            <Img
              src={staticFile(thumbPath(name))}
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
          </div>
        );
      })}
    </div>
  );
};
