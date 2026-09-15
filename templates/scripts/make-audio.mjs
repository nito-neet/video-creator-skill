/**
 * BGM と効果音をプログラムで合成して public/audio/track.wav を作る。
 * 外部の音源ファイルは一切使わない（すべてこの場で生成したオリジナル）。
 * タイミングは src/config/timeline.ts をそのまま読む（映像と同じ唯一の出所）。
 */
import {registerHooks} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

registerHooks({
  resolve(spec, ctx, next) {
    if (spec.startsWith('.') && !/\.\w+$/.test(spec)) {
      try {
        return next(spec + '.ts', ctx);
      } catch {
        // 拡張子なしで解決できなければそのまま次へ
      }
    }
    return next(spec, ctx);
  },
});

const {SFX, HOLDS} = await import('../src/config/timeline.ts');
const {FPS, DURATION, BEAT} = await import('../src/config/theme.ts');

const SR = 44100;
const N = Math.round((DURATION / FPS) * SR);
const L = new Float64Array(N);
const R = new Float64Array(N);

const f2s = (f) => (f / FPS) * SR;
const inHold = (f) => HOLDS.some(([a, b]) => f >= a && f < b);

// ---------- 小さな道具 ----------
let seed = 20260915;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
};
const clampI = (v) => Math.max(-1, Math.min(1, v));

const makeLP = (c) => {
  let y = 0;
  return (x) => (y += c * (x - y));
};
const makeHP = (c) => {
  let y = 0;
  return (x) => {
    y += c * (x - y);
    return x - y;
  };
};

const add = (startSample, buf, gain = 1, pan = 0) => {
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const s0 = Math.round(startSample);
  for (let i = 0; i < buf.length; i++) {
    const j = s0 + i;
    if (j < 0 || j >= N) continue;
    L[j] += buf[i] * gl;
    R[j] += buf[i] * gr;
  }
};

const env = (i, a, d) => {
  const at = a * SR;
  const dt = Math.max(1, d * SR);
  if (i < at) return i / at;
  return Math.exp((-3.2 * (i - at)) / dt);
};

// ---------- 音色 ----------
const kick = (gain = 1) => {
  const len = Math.round(0.16 * SR);
  const b = new Float64Array(len);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 42 + 130 * Math.exp(-42 * t);
    ph += (2 * Math.PI * f) / SR;
    const click = i < 60 ? rnd() * 0.25 * (1 - i / 60) : 0;
    b[i] = (Math.sin(ph) * Math.exp(-14 * t) + click) * gain;
  }
  return b;
};

const hat = (gain = 1, open = false) => {
  const len = Math.round((open ? 0.09 : 0.032) * SR);
  const b = new Float64Array(len);
  const hp = makeHP(0.06);
  for (let i = 0; i < len; i++) {
    b[i] = hp(rnd()) * Math.exp(-(open ? 30 : 95) * (i / SR)) * gain;
  }
  return b;
};

const bass = (freq, durSec, gain = 1) => {
  const len = Math.round(durSec * SR);
  const b = new Float64Array(len);
  const lp = makeLP(0.05);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    ph += (2 * Math.PI * freq) / SR;
    const saw = ((ph / (2 * Math.PI)) % 1) * 2 - 1;
    const sq = Math.sin(ph) > 0 ? 1 : -1;
    b[i] = lp(saw * 0.55 + sq * 0.25 + Math.sin(ph) * 0.5) * env(i, 0.008, durSec * 0.9) * gain;
  }
  return b;
};

const pad = (freqs, durSec, gain = 1) => {
  const len = Math.round(durSec * SR);
  const b = new Float64Array(len);
  const lp = makeLP(0.12);
  const ph = freqs.map(() => 0);
  for (let i = 0; i < len; i++) {
    let v = 0;
    for (let k = 0; k < freqs.length; k++) {
      ph[k] += (2 * Math.PI * freqs[k] * (1 + 0.0015 * Math.sin(i / 9000 + k))) / SR;
      v += Math.sin(ph[k]) + 0.18 * Math.sin(ph[k] * 2);
    }
    v /= freqs.length;
    const a = Math.min(1, i / (0.35 * SR));
    const r = Math.min(1, (len - i) / (0.8 * SR));
    b[i] = lp(v) * a * r * gain;
  }
  return b;
};

const bell = (freq, gain = 1) => {
  const len = Math.round(0.5 * SR);
  const b = new Float64Array(len);
  let p1 = 0;
  let p2 = 0;
  for (let i = 0; i < len; i++) {
    p1 += (2 * Math.PI * freq) / SR;
    p2 += (2 * Math.PI * freq * 2.76) / SR;
    const t = i / SR;
    b[i] = (Math.sin(p1) * Math.exp(-6 * t) + Math.sin(p2) * 0.3 * Math.exp(-14 * t)) * gain;
  }
  return b;
};

// ---------- 効果音の素 ----------
const noiseBurst = (durSec, cut, gain, decay) => {
  const len = Math.round(durSec * SR);
  const b = new Float64Array(len);
  const lp = makeLP(cut);
  for (let i = 0; i < len; i++) b[i] = lp(rnd()) * Math.exp(-decay * (i / SR)) * gain;
  return b;
};

const sweep = (f0, f1, durSec, gain, noiseMix = 0) => {
  const len = Math.round(durSec * SR);
  const b = new Float64Array(len);
  const lp = makeLP(0.2);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / len;
    const f = f0 * Math.pow(f1 / f0, t);
    ph += (2 * Math.PI * f) / SR;
    const e = Math.pow(Math.sin(Math.PI * t), 0.8);
    b[i] = (Math.sin(ph) * (1 - noiseMix) + lp(rnd()) * noiseMix) * e * gain;
  }
  return b;
};

function mix(bufs) {
  const len = Math.max(...bufs.map((x) => x.length));
  const out = new Float64Array(len);
  for (const x of bufs) for (let i = 0; i < x.length; i++) out[i] += x[i];
  return out;
}

const SFX_GEN = {
  impact: (g) => mix([noiseBurst(0.18, 0.5, 0.55 * g, 26), sweep(220, 55, 0.18, 0.75 * g)]),
  sweepDown: (g) => sweep(2400, 240, 0.42, 0.5 * g, 0.55),
  vanish: (g) => sweep(1800, 700, 0.1, 0.45 * g, 0.2),
  subHit: (g) => sweep(85, 34, 0.3, 0.95 * g),
  swipe: (g) => noiseBurst(0.22, 0.28, 0.42 * g, 14),
  tick: (g) => noiseBurst(0.02, 0.9, 0.5 * g, 260),
  bigHit: (g) => mix([sweep(110, 32, 0.55, 1.0 * g), noiseBurst(0.3, 0.45, 0.6 * g, 16), bell(1046.5, 0.22 * g)]),
  whoosh: (g) => {
    const len = Math.round(0.2 * SR);
    const b = new Float64Array(len);
    let st = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      st += (0.02 + 0.5 * t) * (rnd() - st);
      b[i] = st * Math.sin(Math.PI * t) * 0.75 * g;
    }
    return b;
  },
  click: (g) => noiseBurst(0.016, 0.8, 0.45 * g, 320),
  swell: (g) => {
    const len = Math.round(0.5 * SR);
    const b = new Float64Array(len);
    const lp = makeLP(0.03);
    let ph = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      ph += (2 * Math.PI * (70 + 40 * t)) / SR;
      b[i] = (Math.sin(ph) * 0.6 + lp(rnd()) * 0.5) * t * t * 0.8 * g;
    }
    return b;
  },
  finalHit: (g) => mix([sweep(120, 38, 0.6, 0.9 * g), noiseBurst(0.35, 0.4, 0.5 * g, 14), bell(783.99, 0.2 * g)]),
};

// ---------- BGM（beat-map.md の展開表のとおり） ----------
const HZ = {
  Ab1: 51.91,
  C2: 65.41,
  Eb2: 77.78,
  G2: 98.0,
  Ab2: 103.83,
  C3: 130.81,
  Eb3: 155.56,
  G3: 196.0,
  Bb3: 233.08,
  C5: 523.25,
  Eb5: 622.25,
  G5: 783.99,
};

const beatsTotal = DURATION / BEAT;
for (let i = 0; i < beatsTotal; i++) {
  const f = i * BEAT;
  if (inHold(f)) continue;
  const s = f2s(f);
  const ctaTail = f >= 375;

  // キック
  if (!ctaTail) add(s, kick(f >= 120 && f < 285 ? 0.95 : 0.8));
  if (f >= 120 && f < 285 && i % 2 === 1) add(s + f2s(BEAT * 0.5), kick(0.5));

  // ハット
  if (!ctaTail) {
    const sixteenth = f >= 180 && f < 285;
    const div = sixteenth ? 4 : 2;
    const g = f >= 120 && f < 285 ? 0.3 : 0.18;
    for (let k = 0; k < div; k++) {
      const hf = f + (BEAT / div) * k;
      if (inHold(hf)) continue;
      add(f2s(hf), hat(g * (k === 0 ? 1 : 0.7), k === div - 1 && !sixteenth), 1, k % 2 ? 0.25 : -0.25);
    }
  }

  // ベース
  let bn = null;
  if (f < 60) bn = HZ.C2;
  else if (f >= 75 && f < 105) bn = HZ.C2;
  else if (f >= 105 && f < 120) bn = HZ.G2;
  else if (f >= 120 && f < 285) bn = [HZ.C2, HZ.C2, HZ.Eb2, HZ.G2][i % 4];
  else if (f >= 300 && f < 345) bn = HZ.Ab2;
  else if (f >= 345) bn = HZ.C2;
  if (bn) add(s, bass(bn, f >= 345 ? 1.4 : 0.46, f >= 345 ? 0.2 : 0.3));

  // ベル
  if (f >= 120 && f < 285 && i % 4 === 0) add(s, bell(HZ.C5, 0.14), 1, 0.3);
  if (f >= 180 && f < 285 && i % 4 === 2) add(s, bell(HZ.G5, 0.11), 1, -0.3);
}

// パッド
add(f2s(75), pad([HZ.C3, HZ.Eb3, HZ.G3], 2.0, 0.09));
add(f2s(135), pad([HZ.C3, HZ.Eb3, HZ.G3, HZ.Bb3], 5.0, 0.085));
add(f2s(300), pad([HZ.Ab2, HZ.C3, HZ.Eb3], 1.5, 0.1));
add(f2s(345), pad([HZ.C3, HZ.Eb3, HZ.G3, HZ.C3 * 2], 3.4, 0.12));
add(f2s(345), bell(HZ.Eb5, 0.1), 1, 0.2);
add(f2s(345), bell(HZ.Ab1 * 8, 0.06), 1, -0.2);

// ---------- 効果音 ----------
for (const {at, kind, gain = 0.6} of SFX) {
  const gen = SFX_GEN[kind];
  if (!gen) throw new Error(`未定義の効果音: ${kind}`);
  // 音の山を「着地フレーム」に合わせるため、アタック分だけ手前から鳴らす
  const lead = kind === 'sweepDown' || kind === 'swell' ? 0 : 0.012 * SR;
  add(f2s(at) - lead, gen(gain));
}

// ---------- 仕上げ ----------
const fadeFrom = f2s(420);
for (let i = 0; i < N; i++) {
  if (i >= fadeFrom) {
    const g = 1 - (i - fadeFrom) / (N - fadeFrom);
    L[i] *= g;
    R[i] *= g;
  }
}

let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 0.9);
  R[i] = Math.tanh(R[i] * 0.9);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const target = Math.pow(10, -1.5 / 20);
const norm = peak > 0 ? target / peak : 1;

const bytes = Buffer.alloc(44 + N * 4);
bytes.write('RIFF', 0);
bytes.writeUInt32LE(36 + N * 4, 4);
bytes.write('WAVEfmt ', 8);
bytes.writeUInt32LE(16, 16);
bytes.writeUInt16LE(1, 20);
bytes.writeUInt16LE(2, 22);
bytes.writeUInt32LE(SR, 24);
bytes.writeUInt32LE(SR * 4, 28);
bytes.writeUInt16LE(4, 32);
bytes.writeUInt16LE(16, 34);
bytes.write('data', 36);
bytes.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  bytes.writeInt16LE(Math.round(clampI(L[i] * norm) * 32767), 44 + i * 4);
  bytes.writeInt16LE(Math.round(clampI(R[i] * norm) * 32767), 46 + i * 4);
}

const out = path.resolve('public/audio/track.wav');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, bytes);
console.log(`書き出し: ${out}`);
console.log(`長さ ${(N / SR).toFixed(3)}s / ${SR}Hz / stereo / 効果音 ${SFX.length} 点`);
console.log(`正規化前ピーク ${(20 * Math.log10(peak)).toFixed(2)} dBFS -> -1.50 dBFS`);
