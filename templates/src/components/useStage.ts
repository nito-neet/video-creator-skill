import {useVideoConfig} from 'remotion';

/**
 * 縦 1080x1920 が設計の基準。各シーンは「縦の設計値 × s」でサイズを出す。
 * 横 1920x1080 は横幅に 1.8 倍の余裕があるので、文字も大きくしないと
 * 画面の中で小さく浮いて見える（実際に静止画チェックでそうなった）。
 * 入り切らない分は motion/fit.ts が縮めるので、ここは強気の係数でよい。
 */
export const useStage = () => {
  const {width, height} = useVideoConfig();
  const vertical = height >= width;
  return {
    width,
    height,
    vertical,
    s: vertical ? 1 : 1.4,
    /** SNS の UI が被る領域を避けるための内側余白 */
    padX: vertical ? width * 0.08 : width * 0.08,
    padY: vertical ? height * 0.12 : height * 0.08,
  };
};
