/**
 * サイトの下見・素材の切り出しに使うブラウザを探す。
 *
 * 人によって入っているものが違うので、上から順に探して最初に見つかったものを使う。
 *   1. 環境変数 CHROME_PATH（自分で指定したいとき）
 *   2. Playwright が入れた Chromium（Playwright / Playwright MCP を使っていれば入っている）
 *   3. ふだん使っている Google Chrome
 *   4. Microsoft Edge（Windows なら最初から入っている）
 * Windows / macOS / Linux のどれでも動く。
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const exists = (p) => {
  try {
    return Boolean(p) && fs.existsSync(p);
  } catch {
    return false;
  }
};

/** Playwright のキャッシュから chromium-<番号> を探す（番号は環境ごとに違う）。 */
const fromPlaywrightCache = () => {
  const roots = [
    process.env.PLAYWRIGHT_BROWSERS_PATH,
    process.platform === 'win32' && process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'ms-playwright')
      : null,
    process.platform === 'darwin' ? path.join(os.homedir(), 'Library/Caches/ms-playwright') : null,
    process.platform === 'linux' ? path.join(os.homedir(), '.cache/ms-playwright') : null,
  ].filter(exists);

  const inner = {
    win32: ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe'],
    darwin: ['chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'],
    linux: ['chrome-linux/chrome'],
  }[process.platform] ?? [];

  for (const root of roots) {
    const dirs = fs
      .readdirSync(root)
      .filter((d) => d.startsWith('chromium-') && !d.includes('headless'))
      // 番号が大きい＝新しいものを優先
      .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
    for (const d of dirs) {
      for (const rel of inner) {
        const p = path.join(root, d, rel);
        if (exists(p)) return p;
      }
    }
  }
  return null;
};

/** ふだん使っているブラウザ。 */
const fromSystem = () => {
  const list = {
    win32: [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : null,
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ],
    linux: ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge'],
  }[process.platform] ?? [];
  return list.find(exists) ?? null;
};

/** 見つかったブラウザのパスを返す。見つからなければ、どうすればいいかを書いて落とす。 */
export const findChrome = ({quiet = false} = {}) => {
  const found =
    (exists(process.env.CHROME_PATH) ? process.env.CHROME_PATH : null) ?? fromPlaywrightCache() ?? fromSystem();

  if (!found) {
    throw new Error(
      [
        'サイトを見に行くためのブラウザが見つかりませんでした。',
        '',
        '次のどれかで用意できます。',
        '  ・Chromium を入れる:  npx playwright install chromium',
        '  ・Google Chrome を入れる（ふだん使いのものでOK）',
        '  ・場所を自分で指定する: 環境変数 CHROME_PATH にブラウザの実行ファイルのパスを入れる',
      ].join('\n')
    );
  }
  if (!quiet) console.log('ブラウザ:', found);
  return found;
};

export default findChrome;
