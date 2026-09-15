/**
 * 画面に出す文言。縦横のコンポジションで共通。
 *
 * ★ このファイルは雛形。**必ず全部書き換える。**
 *   プレースホルダのまま書き出すと「（主役の文言）」がそのまま動画に出る。
 *   実際に作った例は copy.example.ts を見ること。
 *
 * 1カットの日本語は 2〜12 文字。長い文は意味の単位に割って、見せる順番を組み替えてよい。
 * 階層は 主役 / 補足 / 注釈 の3つ。サイズ差は大きく取る。
 */
export const COPY = {
  /** C1 フック。補足（小）＋主役（大）の2行。視聴者の自分事から入る。 */
  c1: {lead: '補足、', hero: '主役の一言。'},

  /** C2 痛点。body の文字が1字ずつ消え、mark だけが取り残される。 */
  c2: {body: '消える文字', mark: '？'},

  /** C4 ブランドの核。lead の上に punch を叩きつけて上書きする。 */
  c4: {lead: '前置きの一文、', punch: '言い切り。', punchAccentFrom: 1},

  /** C5 名前。word は英字ワードマーク、note はその下の小さい説明。 */
  c5: {word: 'BRAND', note: '― タグライン ―'},

  /** C6 サービスの全景。実物の画面と一緒に置く短い一言。 */
  c6: {hero: 'これ、ぜんぶ。'},

  /** C7 最強点の数字。value は実物の枚数・件数と必ず一致させる。 */
  c7: {value: 12, unit: '単位', note: '補足の注釈'},

  /**
   * C8–C10 ベネフィット3連（各0.5秒）。
   * ui はその言葉の裏づけになる画面の切り抜き名（src/config/assets.ts の UI のキー）。
   * tone は accent（オレンジ系）か cyan（水色系）。
   */
  benefits: [
    {accent: '強調', rest: '、その1。', note: '', tone: 'cyan', ui: 'proof-a'},
    {accent: '強調', rest: '、その2。', note: '', tone: 'accent', ui: 'proof-b'},
    {accent: '強調', rest: '。', note: '添える注釈。', tone: 'accent', ui: 'proof-c'},
  ],

  /** C11 段階・階層。num だけ拡大して見せる。stages は積み上げる画面の切り抜き名。 */
  c11: {num: '4', title: '段階で、順番に。', stages: ['stage-1', 'stage-2', 'stage-3', 'stage-4']},

  /** C13 最初の一歩。散った文字が中央に集まる。 */
  c13: {lead: 'まず、', accent: '現在地', after: 'から。'},

  /** C14 エンドカード。button は行動、url は行き先。 */
  cta: {
    word: 'BRAND',
    note: '― タグライン ―',
    button: '行動をうながす一言',
    url: 'example.com',
  },
} as const;
