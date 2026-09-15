import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Background} from './components/Background';
import {CUTS, CutId} from './config/timeline';
import {C1Hook} from './scenes/C1Hook';
import {C2Erase} from './scenes/C2Erase';
import {Hold} from './scenes/Hold';
import {C4Stamp} from './scenes/C4Stamp';
import {C5Logo} from './scenes/C5Logo';
import {C6Home} from './scenes/C6Home';
import {C7Number} from './scenes/C7Number';
import {Benefit} from './scenes/Benefit';
import {C11Steps} from './scenes/C11Steps';
import {C13Locate} from './scenes/C13Locate';
import {CtaCard} from './scenes/CtaCard';

const SCENES: Record<CutId, React.ReactNode> = {
  c1: <C1Hook />,
  c2: <C2Erase />,
  hold1: <Hold remnant />,
  c4: <C4Stamp />,
  c5: <C5Logo />,
  c6: <C6Home />,
  c7: <C7Number />,
  c8: <Benefit index={0} />,
  c9: <Benefit index={1} />,
  c10: <Benefit index={2} />,
  c11: <C11Steps />,
  hold2: <Hold panels />,
  c13: <C13Locate />,
  cta: <CtaCard />,
};

export const Movie: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => (
  <AbsoluteFill>
    <Background />
    {CUTS.map((c) => (
      <Sequence key={c.id} from={c.from} durationInFrames={c.durationInFrames} name={c.id}>
        {SCENES[c.id]}
      </Sequence>
    ))}
    {withAudio ? <Audio src={staticFile('audio/track.wav')} /> : null}
  </AbsoluteFill>
);
