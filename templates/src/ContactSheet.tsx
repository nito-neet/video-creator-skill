import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

export type SheetProps = {
  /** public/ からの相対パス。scripts/make-contactsheet.mjs が並べる。 */
  files: string[];
  /** 各コマの下に出す見出し（フレーム番号と秒）。 */
  labels: string[];
  cols: number;
  tileW: number;
  tileH: number;
};

const GAP = 10;
const LABEL_H = 34;

/** コマ数と大きさから、一覧画像そのもののサイズを決める。 */
export const sheetMetadata = ({props}: {props: SheetProps}) => {
  const cols = Math.max(1, props.cols);
  const rows = Math.max(1, Math.ceil(props.files.length / cols));
  const even = (n: number) => Math.round(n / 2) * 2;
  return {
    width: even(cols * props.tileW + (cols + 1) * GAP),
    height: even(rows * (props.tileH + LABEL_H) + (rows + 1) * GAP),
  };
};

/**
 * 静止画チェック用の一覧画像。
 * ffmpeg の tile フィルタでも作れるが、**ffmpeg が入っていない人でも確認できるように**
 * Remotion 自身で組んでいる。おまけで各コマにフレーム番号を入れられる。
 */
export const ContactSheet: React.FC<SheetProps> = ({files, labels, cols, tileW, tileH}) => (
  <AbsoluteFill style={{background: '#111111', padding: GAP, boxSizing: 'border-box'}}>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${tileW}px)`,
        gap: GAP,
        alignContent: 'start',
      }}
    >
      {files.map((f, i) => (
        <div key={f} style={{width: tileW}}>
          <Img src={staticFile(f)} style={{width: tileW, height: tileH, display: 'block', objectFit: 'contain'}} />
          <div
            style={{
              height: LABEL_H,
              lineHeight: `${LABEL_H}px`,
              fontFamily: 'monospace',
              fontSize: 20,
              color: '#9fb0ba',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {labels[i] ?? ''}
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
