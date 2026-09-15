/**
 * サイトから素材を切り出す指示書。scripts/capture-site.mjs が読む。
 * 下見（scripts/site-explore.mjs）の結果を見てから、この中身を書き換える。
 *
 * 切り出した名前が、そのまま src/config/copy.ts の `ui` / `stages` のキーになる。
 * 名前は用途で付ける（home / proof-a / stage-1 / widget）。サイト側の呼び名に引きずられない。
 */
export default {
  site: 'https://example.com/',

  /** 撮影サイズ。CSS ピクセル。clip の座標もこの単位。 */
  viewport: {width: 1440, height: 900},
  /** 解像度の倍率。2 なら 2 倍の画素数で撮れる（動画で拡大しても粗くならない）。 */
  scale: 2,

  /** 入口のオーバーレイで押す文字。上から順に試して、最初に見つかったものを押す。 */
  enter: ['あとで', 'スキップ', '閉じる'],

  /**
   * ダークモード切り替えボタンの aria-label / title。
   * **背景が暗いサイトなら必ず指定する。** 動画の背景色と揃うと、切り抜きが枠なしで溶ける。
   * 下見の report.json の darkToggle にそのまま入っている。
   */
  darkToggle: 'ダークモードに切り替える',

  pages: [
    {
      path: '/',
      shots: [
        // サービスの全景。C6（画面が奥から迫るカット）で使う
        {name: 'home', type: 'viewport'},

        // 段階・階層の見出し。C11（積層カット）で使う
        // 横長すぎると字が読めないので width で詰める（ここが一番やりがちな失敗）
        {name: 'stage-1', type: 'text', text: '第1段階の見出し', maxW: 1200, maxH: 200, width: 520, pad: 10},
        {name: 'stage-2', type: 'text', text: '第2段階の見出し', maxW: 1200, maxH: 200, width: 520, pad: 10},
        {name: 'stage-3', type: 'text', text: '第3段階の見出し', maxW: 1200, maxH: 200, width: 520, pad: 10},
        {name: 'stage-4', type: 'text', text: '第4段階の見出し', maxW: 1200, maxH: 200, width: 520, pad: 10},

        // ベネフィットの裏づけ。座標で取るのがいちばん確実。
        // 画面の下にあるものは scrollTo で目印の文字までスクロールしてから撮る
        {name: 'proof-c', type: 'clip', scrollTo: 'セクションの見出し', clip: {x: 262, y: 60, width: 1178, height: 300}},

        // 現在地・進捗のウィジェット
        {name: 'widget', type: 'text', text: 'STEP', maxW: 320, maxH: 220},
      ],
    },
    {
      // 詳細ページの中身も撮る
      path: '/detail/example',
      shots: [
        {name: 'proof-a', type: 'text', text: 'STEP 1', maxW: 1000, maxH: 420},
        {name: 'proof-b', type: 'text', text: 'このコースを終えると', maxW: 1000, maxH: 220, width: 540, offsetY: 4},
      ],
    },
  ],

  /**
   * 画像を直接落とす。ロゴは CSS の background-image になっていることが多く、
   * 要素を撮ると小さいままなので、元ファイルを取りに行く。
   * 下見の report.json の bgImages / images に URL が載っている。
   */
  download: [{url: '/brand/logo-mark.png', as: 'logo-mark.png'}],

  /**
   * ページ内の画像から、URL にこの文字列を含むものを全部落とす。
   * 数字カウントと同期させるグリッド（C7）の材料になる。
   * 並び順も記録するので、埋まるときに色が自然に移り変わる。
   */
  thumbs: {path: '/', pattern: '/thumb/'},
};
