/**
 * 見切れ防止。文字数から必要な幅を見積もって、入り切らなければ字を縮める。
 * 静止画チェックで「主要メッセージの端が切れる」事故が続いたので、
 * 各シーンで数値を手打ちせず必ずこれを通す。
 */
const advance = (ch: string) => {
  if (/[0-9]/.test(ch)) return 0.6;
  if (/[A-Za-z.]/.test(ch)) return 0.62;
  if (/[ -~]/.test(ch)) return 0.5;
  return 0.99; // 全角（約物も安全側に全角として数える）
};

/** text が maxWidth に収まる font-size を返す（desired を超えない）。 */
export const fitSize = (text: string, desired: number, maxWidth: number) => {
  const units = [...text].reduce((a, c) => a + advance(c), 0);
  // 端に張り付くと切れて見えるので 4% だけ内側に余らせる
  return Math.min(desired, (maxWidth * 0.96) / units);
};

/** 拡大の山（叩きつけの最大倍率）まで含めて収める。 */
export const fitSizeScaled = (text: string, desired: number, maxWidth: number, peakScale: number) =>
  fitSize(text, desired, maxWidth / peakScale);
