/** Draw slots are P1..P6 (indices 0-5) plus the Bonus ball (index 6). */
const POSITION_LABELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'B'];

/** The 6 sequential neighbour pairs: P1-P2, P2-P3, ... P6-Bonus. */
const SEQUENTIAL_PAIRS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]];

/** Full 7x7 product, used when any position can pair with any other. */
const ALL_PAIRS = (() => {
  const pairs = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) pairs.push([i, j]);
  }
  return pairs;
})();

/** Same as ALL_PAIRS but deduplicated (i < j only) — used by Same Day. */
const ALL_PAIRS_UNORDERED = ALL_PAIRS.filter(([i, j]) => j > i);

module.exports = { POSITION_LABELS, SEQUENTIAL_PAIRS, ALL_PAIRS, ALL_PAIRS_UNORDERED };
