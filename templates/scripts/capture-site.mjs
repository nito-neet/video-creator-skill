/**
 * capture.config.mjs に書いた指示どおりに、サイトから動画用の素材を切り出す。
 * 出力先は public/assets/（Remotion の staticFile() から読む）。
 *
 *   node scripts/capture-site.mjs
 *
 * 切り出し方は3種類。
 *   type: 'viewport'  画面まるごと
 *   type: 'clip'      座標指定（{x, y, width, height}）。いちばん確実
 *   type: 'text'      文字を手がかりに要素を探す。maxW / maxH に収まる最大の祖先を撮る
 *                     width を足すと、その幅に詰めて撮る（横長すぎて字が読めなくなるのを防ぐ）
 *
 * download: 画像の URL を直接落とす（ロゴは CSS の背景画像であることが多いので、これが要る）
 * thumbs:   ページ内の画像から、URL にパターンが含まれるものを全部落とす
 */
import {chromium} from 'playwright-core';
import {findChrome} from './find-chrome.mjs';
import fs from 'node:fs';
import path from 'node:path';
import cfg from '../capture.config.mjs';

const CHROME = findChrome();
const ASSETS = path.resolve('public/assets');
const UIDIR = path.join(ASSETS, 'ui');
const THUMBDIR = path.join(ASSETS, 'thumbs');
for (const d of [ASSETS, UIDIR, THUMBDIR, path.resolve('materials')]) fs.mkdirSync(d, {recursive: true});

const vp = cfg.viewport ?? {width: 1440, height: 900};
const browser = await chromium.launch({executablePath: CHROME});
const ctx = await browser.newContext({viewport: vp, deviceScaleFactor: cfg.scale ?? 2});
const page = await ctx.newPage();

/** 入口のオーバーレイを抜けて、必要ならダークモードにする。 */
const openApp = async (target) => {
  await page.goto(new URL(target ?? '/', cfg.site).href, {waitUntil: 'networkidle'});
  await page.waitForTimeout(900);
  for (const t of cfg.enter ?? []) {
    const el = page.locator(`text=${t}`).first();
    if (await el.count()) {
      await el.click().catch(() => {});
      await page.waitForTimeout(1500);
      break;
    }
  }
  if (cfg.darkToggle) {
    const btn = page.locator(`button[aria-label="${cfg.darkToggle}"], button[title="${cfg.darkToggle}"]`).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1000);
    }
  }
};

/** 遅延読み込みを起こす。これをやらないと下のほうの画像が空で撮れる。 */
const wakeLazyImages = async () => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
};

/**
 * 文字を手がかりに要素を探すときの共通の絞り込み。
 * これをブラウザ側に文字列で渡して使う。
 *
 * Next.js などは <script> の中に画面と同じ文字を JSON で持っている。
 * 素直に textContent で探すと、その見えない <script>（幅も高さも 0）を掴んで
 * 「見つからない」で終わる。実際に踏んだので、必ず見える要素だけに絞る。
 */
const FIND_FN = `(t) => {
  const hidden = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|META|LINK|HEAD|TITLE)$/;
  return [...document.querySelectorAll('*')].filter((e) => {
    if (hidden.test(e.tagName)) return false;
    if (e.children.length >= 40) return false;
    if (!(e.textContent || '').includes(t)) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}`;

/** 指定した文字を含む要素を画面内に入れる。画面の下にあるものはこれが無いと撮れない。 */
const scrollToText = async (text, block = 'center') => {
  const ok = await page.evaluate(
    ([t, b, findSrc]) => {
      const el = eval(findSrc)(t).pop();
      if (!el) return false;
      el.scrollIntoView({block: b});
      return true;
    },
    [text, block, FIND_FN]
  );
  await page.waitForTimeout(700);
  return ok;
};

/** 要素の位置を測る。type:'text' 用。 */
const measure = async (text, maxW, maxH, up) =>
  page.evaluate(
    ([t, mw, mh, u, findSrc]) => {
      const hits = eval(findSrc)(t);
      let el = hits[hits.length - 1];
      if (!el) return null;
      if (u) for (let i = 0; i < u && el.parentElement; i++) el = el.parentElement;
      let best = null;
      for (let i = 0; i < 12 && el; i++) {
        const r = el.getBoundingClientRect();
        if (r.width <= mw && r.height <= mh && r.width > 50 && r.height > 20) {
          best = {x: r.x, y: r.y, width: r.width, height: r.height};
        }
        el = el.parentElement;
      }
      return best;
    },
    [text, maxW, maxH, up, FIND_FN]
  );

const shoot = async (shot) => {
  const file = path.join(UIDIR, `${shot.name}.png`);

  // 画面の下にある要素は、先にスクロールして画面内に入れる
  if (shot.scrollTo) {
    const ok = await scrollToText(shot.scrollTo, shot.block ?? 'start');
    if (!ok) console.log(`… ${shot.name}  スクロール先「${shot.scrollTo}」が見つからない`);
  }

  if (shot.type === 'viewport') {
    await page.screenshot({path: file});
    console.log(`○ ${shot.name}  画面まるごと`);
    return;
  }
  if (shot.type === 'clip') {
    await page.screenshot({path: file, clip: shot.clip});
    console.log(`○ ${shot.name}  ${shot.clip.width}x${shot.clip.height}`);
    return;
  }

  // type: 'text' … 一度測って画面内に入れ、スクロール後にもう一度測り直す
  const first = await measure(shot.text, shot.maxW ?? vp.width, shot.maxH ?? vp.height, shot.up ?? 0);
  if (!first) {
    console.log(`× ${shot.name}  「${shot.text}」が見つからない`);
    return;
  }
  if (!shot.scrollTo && (first.y < 0 || first.y + first.height > vp.height)) {
    await scrollToText(shot.text, shot.block ?? 'center');
  }
  const box = await measure(shot.text, shot.maxW ?? vp.width, shot.maxH ?? vp.height, shot.up ?? 0);
  if (!box) {
    console.log(`× ${shot.name}  スクロール後に見失った`);
    return;
  }
  const pad = shot.pad ?? 0;
  const x = Math.max(0, box.x - pad);
  const y = Math.max(0, box.y - pad + (shot.offsetY ?? 0));
  const width = Math.min(vp.width - x, shot.width ?? box.width + pad * 2);
  const height = Math.min(vp.height - y, shot.height ?? box.height + pad * 2);
  await page.screenshot({path: file, clip: {x, y, width, height}});
  console.log(`○ ${shot.name}  ${Math.round(width)}x${Math.round(height)}`);
};

// ---------- ページごとに撮る ----------
for (const p of cfg.pages ?? [{path: '/', shots: cfg.shots ?? []}]) {
  await openApp(p.path);
  if (p.lazy !== false) await wakeLazyImages();
  if (p.transparent) await page.addStyleTag({content: '*{background-color:transparent !important}'});
  for (const shot of p.shots ?? []) await shoot(shot);
}

// ---------- 画像を直接落とす（ロゴなど） ----------
for (const d of cfg.download ?? []) {
  const src = typeof d === 'string' ? d : d.url;
  const name = typeof d === 'string' ? path.basename(new URL(src, cfg.site).pathname) : d.as;
  const res = await ctx.request.get(new URL(src, cfg.site).href);
  if (!res.ok()) {
    console.log('× ダウンロード失敗', src);
    continue;
  }
  fs.writeFileSync(path.join(ASSETS, name), await res.body());
  console.log(`○ ${name}  （直接ダウンロード）`);
}

// ---------- サムネをまとめて落とす ----------
if (cfg.thumbs) {
  await openApp(cfg.thumbs.path ?? '/');
  await wakeLazyImages();
  const urls = await page.$$eval(
    'img',
    (els, pattern) => [...new Set(els.map((e) => e.currentSrc || e.src))].filter((u) => u.includes(pattern)),
    cfg.thumbs.pattern
  );
  const order = [];
  for (const u of urls) {
    const name = path.basename(new URL(u).pathname).replace(/\.\w+$/, '');
    const ext = path.extname(new URL(u).pathname) || '.webp';
    const res = await ctx.request.get(u);
    if (!res.ok()) continue;
    fs.writeFileSync(path.join(THUMBDIR, name + ext), await res.body());
    order.push(name);
  }
  fs.writeFileSync(path.resolve('materials/thumb-order.json'), JSON.stringify(order, null, 1));
  console.log(`○ サムネ ${order.length} 点（並び順を materials/thumb-order.json に記録）`);
}

await browser.close();
console.log('完了。次に `node scripts/gen-assets.mjs` を実行すること。');
