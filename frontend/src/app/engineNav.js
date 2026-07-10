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
 * Sidebar/router page grouping for the generic tabbed pairwise pages - V1
 * (Sequential/Family tabs) bundles two algorithms behind one page/tab bar;
 * V2 and Lunchtime to Teatime are standalone single-algorithm pages using
 * the same tabbed-page component with a single tab. Bonus Tracker is NOT
 * here: it's one page with a merged prediction feed and a single "Run
 * Analysis" action across all three of its sub-engines, not a tab bar, so
 * it gets its own dedicated component (see BonusTracker.jsx) the same way
 * V3/Repeats/Best Pairs/Calc do.
 */
export const ENGINE_PAGES = [
  {
    path: 'v1-sequential',
    label: 'V1 Sequential',
    icon: '⚡',
    tabs: [
      { code: 'v1-seq', label: 'Sequential' },
      { code: 'v1-fam', label: 'Family' },
    ],
  },
  { path: 'v2', label: 'V2 Cross-Pattern', icon: '🔀', tabs: [{ code: 'v2', label: 'V2 Cross-Pattern' }] },
  { path: 'lunchtime-teatime', label: 'Lunchtime to Teatime', icon: '☀️', tabs: [{ code: 'same-day', label: 'Lunchtime to Teatime' }] },
];

/** Every engine that supports backtesting - the 7 pairwise engines plus Repeats, V3 and Calc. */
export const BACKTESTABLE_ENGINE_LABELS = {
  ...Object.fromEntries(PAIRWISE_ENGINES.map((e) => [e.code, e.label])),
  repeats: 'Repeats Tracker',
  v3: 'V3 Zubro Tracker',
  calc: 'Prediction Calc',
};
