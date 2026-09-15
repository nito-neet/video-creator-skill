/**
 * ffmpeg / ffprobe を探す。
 *
 * Remotion は自前の ffmpeg を同梱しているので、**入れていない人でもここで見つかる。**
 * ただし同梱のものは機能を削った版で、映像フィルタ（tile など）は使えない。
 * 使えるのは「中身を読む」「音声を取り出す」までと考えること。
 * 一覧画像づくりに ffmpeg は使わない（src/ContactSheet.tsx で組んでいる）。
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const exe = (name) => (process.platform === 'win32' ? `${name}.exe` : name);

/** Remotion が同梱しているもの（node_modules/@remotion/compositor-<環境>/）。 */
const bundled = () => {
  const dir = path.resolve('node_modules/@remotion');
  if (!fs.existsSync(dir)) return null;
  const pkg = fs.readdirSync(dir).find((d) => d.startsWith('compositor-'));
  if (!pkg) return null;
  const ffmpeg = path.join(dir, pkg, exe('ffmpeg'));
  const ffprobe = path.join(dir, pkg, exe('ffprobe'));
  return fs.existsSync(ffmpeg) && fs.existsSync(ffprobe) ? {ffmpeg, ffprobe, bundled: true} : null;
};

/** PATH に通っているもの。 */
const system = () => {
  try {
    execFileSync('ffprobe', ['-version'], {stdio: 'pipe'});
    execFileSync('ffmpeg', ['-version'], {stdio: 'pipe'});
    return {ffmpeg: 'ffmpeg', ffprobe: 'ffprobe', bundled: false};
  } catch {
    return null;
  }
};

/**
 * @param {{preferSystem?: boolean}} opt
 *   preferSystem: 映像フィルタが要る処理では true（同梱版では動かないため）
 */
export const findFfmpeg = ({preferSystem = false} = {}) =>
  preferSystem ? (system() ?? bundled()) : (bundled() ?? system());

export default findFfmpeg;
