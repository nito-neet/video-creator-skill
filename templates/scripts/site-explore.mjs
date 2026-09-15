/**
 * サイトの下見。**ヒアリングの質問を出す前に、まずこれを走らせる。**
 *
 * 取れるもの
 *   - ブランドカラー（CSS変数）・フォント・背景色
 *   - 見出しと本文から拾った「使える数字」（全42コース / 182 STEP のような表示）
 *   - ボタンの文言（CTA 案の材料になる）
 *   - ダークモードの切り替えボタンの有無
 *   - 画像の一覧（サムネ・ロゴの在り処）
 *   - ライト／ダーク両方のスクリーンショット
 *
 * 使い方:
 *   node scripts/site-explore.mjs https://example.com
 *   node scripts/site-explore.mjs https://example.com --enter=あとで,スキップ
 *
 * 出力: materials/explore/ （report.json とスクリーンショット）
 */
import {chromium} from 'playwright-core';
import {findChrome} from './find-chrome.mjs';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = findChrome();

const url = process.argv[2];
if (!url) throw new Error('使い方: node scripts/site-explore.mjs <URL> [--enter=テキスト,テキスト]');
const enterArg = process.argv.find((a) => a.startsWith('--enter='));
const enterTexts = enterArg ? enterArg.split('=')[1].split(',') : ['あとで', 'スキップ', '閉じる', '同意', 'はじめる'];

const out = path.resolve('materials/explore');
fs.mkdirSync(out, {recursive: true});

const browser = await chromium.launch({executablePath: CHROME});
const ctx = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: 2});
const page = await ctx.newPage();

await page.goto(url, {waitUntil: 'networkidle'});
await page.waitForTimeout(1200);
await page.screenshot({path: path.join(out, '01-landing.png')});

// 入口のオーバーレイ（診断・同意・イントロ）を抜ける
let entered = null;
for (const t of enterTexts) {
  const el = page.locator(`text=${t}`).first();
  if (await el.count()) {
    await el.click().catch(() => {});
    await page.waitForTimeout(1500);
    entered = t;
    break;
  }
}
await page.screenshot({path: path.join(out, '02-app.png')});

const report = await page.evaluate(() => {
  const cssVars = {};
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of rules || []) {
      if (r.style) for (const p of r.style) if (p.startsWith('--')) cssVars[p] = r.style.getPropertyValue(p).trim();
    }
  }
  const body = getComputedStyle(document.body);
  const text = document.body.innerText;

  // 「全42コース」「182 STEP」「0 / 4」のような、動画の主役にできる数字
  const numbers = [...new Set((text.match(/[^\n]{0,14}\d[\d,]*[^\n]{0,14}/g) || []).map((s) => s.trim()))]
    .filter((s) => /\d/.test(s))
    .slice(0, 40);

  const buttons = [...document.querySelectorAll('button, a[role="button"], a[class*="btn"], a[class*="button"]')]
    .map((e) => (e.textContent || '').trim())
    .filter((t) => t && t.length <= 24);

  const darkToggle = [...document.querySelectorAll('button')]
    .map((e) => e.getAttribute('aria-label') || e.getAttribute('title') || '')
    .find((l) => /dark|ダーク|テーマ|theme|モード/i.test(l));

  const images = [...document.querySelectorAll('img')]
    .map((e) => ({src: e.currentSrc || e.src, w: e.naturalWidth, h: e.naturalHeight}))
    .filter((x) => x.w >= 120);

  // CSS の背景画像（ロゴがここに隠れていることが多い）
  const bgImages = [];
  for (const e of document.querySelectorAll('*')) {
    const bi = getComputedStyle(e).backgroundImage;
    if (bi && bi.startsWith('url(')) {
      const u = bi.slice(5, -2);
      const r = e.getBoundingClientRect();
      if (r.width >= 16) bgImages.push({url: u, w: Math.round(r.width), h: Math.round(r.height), cls: String(e.className).slice(0, 40)});
    }
  }

  const heads = [...document.querySelectorAll('h1,h2,h3')].slice(0, 20).map((h) => h.textContent.trim().slice(0, 60));

  return {
    title: document.title,
    url: location.href,
    cssVars,
    body: {bg: body.backgroundColor, color: body.color, font: body.fontFamily},
    heads,
    numbers,
    buttons: [...new Set(buttons)],
    darkToggle: darkToggle || null,
    images: [...new Map(images.map((i) => [i.src, i])).values()],
    bgImages: [...new Map(bgImages.map((i) => [i.url, i])).values()],
    docHeight: document.documentElement.scrollHeight,
  };
});
report.entered = entered;

// ダークモードがあれば切り替えて撮る（動画の背景と馴染むのはこちら）
if (report.darkToggle) {
  const btn = page.locator(`button[aria-label="${report.darkToggle}"], button[title="${report.darkToggle}"]`).first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(1200);
    await page.screenshot({path: path.join(out, '03-dark.png')});
    report.darkBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  }
}
await page.screenshot({path: path.join(out, '04-fullpage.png'), fullPage: true});

fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));

await browser.close();

console.log('下見完了:', out);
console.log('タイトル:', report.title);
console.log('入口で押した:', report.entered ?? 'なし');
console.log('ダークモード:', report.darkToggle ?? 'なし', report.darkBg ? `→ ${report.darkBg}` : '');
console.log('背景 / 文字 / フォント:', report.body.bg, '/', report.body.color, '/', report.body.font);
const brandVars = Object.entries(report.cssVars).filter(([k]) => /bg|ink|accent|surface|line|color|brand|primary/.test(k));
console.log('ブランド色:', brandVars.map(([k, v]) => `${k}=${v}`).join(' '));
console.log('ボタン文言:', report.buttons.slice(0, 12).join(' / '));
console.log('画像:', report.images.length, '点 / CSS背景画像:', report.bgImages.length, '点');
console.log('数字の候補（上位15）:');
for (const n of report.numbers.slice(0, 15)) console.log('  ', n);
