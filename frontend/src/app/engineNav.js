/**
 * Per-algorithm metadata for the 7 pairwise engines - used by the Backtesting
 * engine picker, where each algorithm is tested independently regardless of
 * how the pages group them in the sidebar.
 */
export const PAIRWISE_ENGINES = [
  { code: 'v1-seq', label: 'V1 Sequential' },
  { code: 'v1-fam', label: 'V1 Family' },
  { code: 'v2', label: 'V2 Cross-Pattern' },
  { code: 'same-day', label: 'Lunchtime to Teatime' },
  { code: 'bonus-seq', label: 'Bonus Sequential' },
  { code: 'bonus-fam', label: 'Bonus Family' },
  { code: 'bonus-v2', label: 'Bonus V2' },
];

/**
 * Sidebar/router page grouping - mirrors the legacy app's layout, where V1
 * (Sequential/Family tabs) and Bonus Tracker (Sequential/Family/V2 tabs) are
 * each a single page with internal tabs, not separate top-level pages. V2
 * and Lunchtime to Teatime are standalone pages in both the legacy app and
 * here, so they get a single-tab entry.
 */
export const ENGINE_PAGES = [
  {
    path: 'v1-sequential',
    label: 'V1 Sequential',
    tabs: [
      { code: 'v1-seq', label: 'Sequential' },
      { code: 'v1-fam', label: 'Family' },
    ],
  },
  { path: 'v2', label: 'V2 Cross-Pattern', tabs: [{ code: 'v2', label: 'V2 Cross-Pattern' }] },
  { path: 'lunchtime-teatime', label: 'Lunchtime to Teatime', tabs: [{ code: 'same-day', label: 'Lunchtime to Teatime' }] },
  {
    path: 'bonus-tracker',
    label: 'Bonus Tracker',
    tabs: [
      { code: 'bonus-seq', label: 'Sequential' },
      { code: 'bonus-fam', label: 'Family' },
      { code: 'bonus-v2', label: 'V2' },
    ],
  },
];

/** Every engine that supports backtesting - the 7 pairwise engines plus Repeats, V3 and Calc. */
export const BACKTESTABLE_ENGINE_LABELS = {
  ...Object.fromEntries(PAIRWISE_ENGINES.map((e) => [e.code, e.label])),
  repeats: 'Repeats Tracker',
  v3: 'V3 Zubro Tracker',
  calc: 'Prediction Calc',
};
