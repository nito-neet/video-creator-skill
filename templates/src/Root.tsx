import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Movie} from './Movie';
import {DURATION, FPS} from './config/theme';
import {ContactSheet, sheetMetadata} from './ContactSheet';

/**
 * 縦横は同じ Movie を別コンポジションとして持つ。
 * 文言・タイミング・音声は src/config 配下で共通化してあるので、差分はレイアウトだけ。
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MovieVertical"
      component={Movie}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{withAudio: true}}
    />
    <Composition
      id="MovieHorizontal"
      component={Movie}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{withAudio: true}}
    />
    {/* 静止画チェック専用（無音）。音を読まないぶん書き出しが速い。 */}
    <Composition
      id="MovieVerticalSilent"
      component={Movie}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{withAudio: false}}
    />
    <Composition
      id="MovieHorizontalSilent"
      component={Movie}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{withAudio: false}}
    />
    {/* 静止画チェックの一覧画像。scripts/make-contactsheet.mjs から呼ぶ専用。 */}
    <Composition
      id="ContactSheet"
      component={ContactSheet}
      durationInFrames={1}
      fps={1}
      width={1000}
      height={1000}
      defaultProps={{files: [], labels: [], cols: 6, tileW: 324, tileH: 576}}
      calculateMetadata={sheetMetadata}
    />
  </>
);
