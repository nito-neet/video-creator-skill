/**
 * 画面に出す文言。縦横のコンポジションで共通。
 * 出典と重要度は output/script.md を参照。
 */
export const COPY = {
  c1: {lead: 'AI、', hero: '勉強した。'},
  c2: {body: '何が残った', mark: '？'},
  c4: {lead: '読んで終わりに、', punch: 'しない。', punchAccentFrom: 1},
  c5: {word: 'ASTER', note: '― AIの学び場 ―'},
  c6: {label: 'ホーム', hero: 'これ、ぜんぶ。'},
  c7: {value: 42, unit: 'コース', note: '4つのフェーズ'},
  benefits: [
    {accent: '手', rest: 'が、動く。', note: '', tone: 'cyan', ui: 'steps'},
    {accent: '1枚', rest: '、残る。', note: '', tone: 'accent', ui: 'outcome'},
    {accent: '作れる', rest: '。', note: '最後は、自分の手で。', tone: 'accent', ui: 'row-vibe'},
  ],
  c11: {num: '4', title: '段階で、順番に。', stages: ['phase-1', 'phase-2', 'phase-3', 'phase-4']},
  c13: {lead: 'まず、', accent: '現在地', after: 'から。'},
  cta: {
    word: 'ASTER',
    note: '― AIの学び場 ―',
    button: '無料でコースを始める',
    url: 'aster.nito1.com',
  },
} as const;
