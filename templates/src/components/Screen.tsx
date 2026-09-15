import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLOR} from '../config/theme';
import {UI, LOGO_MARK} from '../config/assets';

export type UiKey = keyof typeof UI;

/**
 * サイトの画面の切り抜きを、端末のように枠を付けて置く。
 * 素材はダークモードで撮ってあるので、動画の背景（#002d3d）にそのまま溶ける。
 * crop に 0〜1 を渡すと上から その割合だけ見せる（下を切る）。
 */
export const Screen: React.FC<{
  name: UiKey;
  width: number;
  crop?: number;
  radius?: number;
  border?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({name, width, crop = 1, radius = 18, border = true, shadow = true, style}) => {
  const a = UI[name];
  const fullH = (width * a.h) / a.w;
  return (
    <div
      style={{
        width,
        height: fullH * crop,
        borderRadius: radius,
        overflow: 'hidden',
        border: border ? `2px solid ${COLOR.line2}` : 'none',
        boxShadow: shadow ? `0 ${width * 0.035}px ${width * 0.09}px rgba(0,0,0,0.5)` : 'none',
        background: COLOR.bg,
        lineHeight: 0,
        boxSizing: 'border-box',
        flexShrink: 0,
        ...style,
      }}
    >
      <Img src={staticFile(a.src)} style={{width: '100%', height: fullH, display: 'block', objectFit: 'cover'}} />
    </div>
  );
};

/** ASTER のロゴマーク（本＋羽ペン）。1024px の透過 PNG をそのまま使う。 */
export const LogoMark: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <Img
    src={staticFile(LOGO_MARK.src)}
    style={{width: size, height: size, display: 'block', ...style}}
  />
);
