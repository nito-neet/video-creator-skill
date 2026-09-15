import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLOR, FONT} from '../config/theme';

export const Center: React.FC<{
  children: React.ReactNode;
  align?: 'center' | 'flex-start' | 'flex-end';
  justify?: 'center' | 'flex-start' | 'flex-end';
  style?: React.CSSProperties;
}> = ({children, align = 'center', justify = 'center', style}) => (
  <AbsoluteFill
    style={{
      alignItems: align,
      justifyContent: justify,
      flexDirection: 'column',
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** 背景に薄く敷く単語。不透明度は 3〜12% の範囲でしか使わない。 */
export const GhostWord: React.FC<{
  text: string;
  size: number;
  opacity?: number;
  top?: number | string;
  left?: number | string;
  rotate?: number;
}> = ({text, size, opacity = 0.06, top = '50%', left = '50%', rotate = 0}) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: COLOR.ink,
      opacity,
      whiteSpace: 'nowrap',
      letterSpacing: '-0.04em',
      lineHeight: 1,
    }}
  >
    {text}
  </div>
);

export const Rule: React.FC<{width: number | string; color?: string; height?: number}> = ({
  width,
  color = COLOR.line2,
  height = 2,
}) => <div style={{width, height, background: color}} />;
