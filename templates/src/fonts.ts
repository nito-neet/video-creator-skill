import {continueRender, delayRender} from 'remotion';
// ローカル同梱のフォントのみ。ネットワークには一切依存しない。
// 日本語サブセットを先に、ラテンを後に読み込む（重なる字形はラテン側が優先される）。
import '@fontsource/noto-sans-jp/japanese-500.css';
import '@fontsource/noto-sans-jp/japanese-700.css';
import '@fontsource/noto-sans-jp/japanese-900.css';
import '@fontsource/noto-sans-jp/latin-500.css';
import '@fontsource/noto-sans-jp/latin-700.css';
import '@fontsource/noto-sans-jp/latin-900.css';

const handle = delayRender('Noto Sans JP の読み込み');

Promise.all([
  document.fonts.load('500 100px "Noto Sans JP"', 'あ'),
  document.fonts.load('700 100px "Noto Sans JP"', 'あ'),
  document.fonts.load('900 100px "Noto Sans JP"', 'あ'),
  document.fonts.load('900 100px "Noto Sans JP"', 'A42'),
  document.fonts.load('700 100px "Noto Sans JP"', 'A42'),
])
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
