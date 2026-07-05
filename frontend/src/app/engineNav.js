/** Drives both the router and the sidebar — one entry per pairwise engine. */
export const PAIRWISE_ENGINE_NAV = [
  { code: 'v1-seq', path: 'v1-sequential', label: 'V1 Sequential' },
  { code: 'v1-fam', path: 'v1-family', label: 'V1 Family' },
  { code: 'v2', path: 'v2', label: 'V2 Cross-Draw' },
  { code: 'same-day', path: 'same-day', label: 'Same Day' },
  { code: 'bonus-seq', path: 'bonus-sequential', label: 'Bonus Sequential' },
  { code: 'bonus-fam', path: 'bonus-family', label: 'Bonus Family' },
  { code: 'bonus-v2', path: 'bonus-v2', label: 'Bonus V2' },
];

/** Every engine that supports backtesting - the 7 pairwise engines plus Repeats and V3. */
export const BACKTESTABLE_ENGINE_LABELS = {
  ...Object.fromEntries(PAIRWISE_ENGINE_NAV.map((e) => [e.code, e.label])),
  repeats: 'Repeats Tracker',
  v3: 'V3 Locked Sets',
};
