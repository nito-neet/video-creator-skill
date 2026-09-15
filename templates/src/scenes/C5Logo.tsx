import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLOR, FONT} from '../config/theme';
import {COPY} from '../config/copy';
import {fade, impactShift, slam, tracking} from '../motion';
import {fitSize} from '../motion/fit';
import {cut} from '../config/timeline';
import {useStage} from '../components/useStage';
import {LogoMark} from '../components/Screen';
import {Rule} from '../components/primitives';

/**
 * C5 名前を覚えさせる。
 * v2 ではサイトの実物のロゴマーク（本＋羽ペン、1024px の透過 PNG）を叩きつけ、
 * 同時に ASTER の5文字が字間を閉じて収束する（＝集まる）。
 */
export const C5Logo: React.FC = () => {
  const f = useCurrentFrame();
  const {s, vertical, width, padX} = useStage();
  const land = cut('c5').land;
  const safe = vertical ? width - padX * 2 : (width - padX * 2) * 0.5;

  const wordSize = fitSize(COPY.c5.word, 200 * s, safe);
  const wordW = wordSize * 0.62 * COPY.c5.word.length;
  const openPx = Math.max(0, (safe - wordW) / (COPY.c5.word.length - 1));
  const noteSize = fitSize(COPY.c5.note, 40 * s, safe * 0.85);

  const markSize = (vertical ? 300 : 260) * s;
  const markScale = slam(f, 0, land, 1.7);
  const shift = impactShift(f, land, 6 * s);
  const tr = tracking(f, land - 2, 14, openPx, 6 * s);
  const noteTr = tracking(f, land + 4, 12, 2 * s, 11 * s);

  const Word = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * s}}>
      <Rule width={safe * 0.9} color={COLOR.line2} height={2} />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: wordSize,
          color: COLOR.ink,
          letterSpacing: tr,
          marginRight: -tr,
          whiteSpace: 'nowrap',
          lineHeight: 1.1,
        }}
      >
        {COPY.c5.word}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: noteSize,
          color: COLOR.ink3,
          letterSpacing: noteTr,
          marginRight: -noteTr,
          opacity: fade(f, land + 4, 10),
          whiteSpace: 'nowrap',
        }}
      >
        {COPY.c5.note}
      </div>
      <Rule width={safe * 0.9} color={COLOR.line2} height={2} />
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: vertical ? 44 * s : width * 0.06,
        transform: `translateY(${shift}px)`,
      }}
    >
      <LogoMark size={markSize} style={{transform: `scale(${markScale})`}} />
      {Word}
    </AbsoluteFill>
  );
};
