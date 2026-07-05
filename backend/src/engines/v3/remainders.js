const { NUMBER_GROUPS } = require('./chart');
const { sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

function buildDrawnSet(sortedDraws, window) {
  const s = new Set();
  sortedDraws.slice(-window).forEach((d) => drawValues(d).forEach((n) => s.add(n)));
  return s;
}

/** Chart lines with exactly 2 or 3 numbers left undrawn (and at least 1 already hit). */
function qualifyingInWindow(drawnSet) {
  const pairs = [];
  const triplets = [];
  NUMBER_GROUPS.forEach((line, lineIdx) => {
    const remaining = line.filter((n) => !drawnSet.has(n));
    const hit = line.filter((n) => drawnSet.has(n));
    if (hit.length < 1) return;
    if (remaining.length === 2) pairs.push({ line, lineIdx, remaining, hit });
    else if (remaining.length === 3) triplets.push({ line, lineIdx, remaining, hit });
  });
  return { pairs, triplets };
}

/**
 * A line qualifying in the 3-draw window also qualifies in the 2- and
 * 1-draw windows (supersets), so each line is tagged with the OLDEST
 * (largest) window it qualifies in - that's the more significant signal.
 */
function dedupByEarliestWindow(inWindow3, inWindow2, inWindow1) {
  const byKey = {};
  const tag = (items, win) => {
    items.forEach((item) => {
      const k = item.lineIdx;
      if (!byKey[k]) byKey[k] = { ...item, earliestWin: win };
    });
  };
  tag(inWindow3, 3);
  tag(inWindow2, 2);
  tag(inWindow1, 1);
  return Object.values(byKey);
}

/** Groups lines that resolve to the exact same remaining-number combo, counting how many chart lines back it. */
function groupByRemaining(items) {
  const groups = {};
  items.forEach((item) => {
    const remaining = item.remaining.slice().sort((a, b) => a - b);
    const key = remaining.join('-');
    if (!groups[key]) {
      groups[key] = {
        remaining,
        lines: [],
        lineIdxs: [],
        hitArrays: [],
        earliestWin: item.earliestWin,
        line: item.line,
        lineIdx: item.lineIdx,
        hit: item.hit,
      };
    }
    groups[key].lines.push(item.line);
    groups[key].lineIdxs.push(item.lineIdx);
    groups[key].hitArrays.push(item.hit);
    if (item.earliestWin > groups[key].earliestWin) groups[key].earliestWin = item.earliestWin;
  });
  return Object.values(groups).map((g) => ({ ...g, backingCount: g.lines.length }));
}

function sortByEarliestThenBacking(a, b) {
  if (b.earliestWin !== a.earliestWin) return b.earliestWin - a.earliestWin;
  if (b.backingCount !== a.backingCount) return b.backingCount - a.backingCount;
  return a.remaining[0] - b.remaining[0];
}

/**
 * Unifies "pairs" (2 numbers left to complete a chart line) and "triplets"
 * (3 left) across the last 1/2/3-draw windows into one deduplicated,
 * ranked list each - the live prediction view (not a historical backtest).
 */
function computeRemainders(draws) {
  const sorted = sortDraws(draws);
  if (!sorted.length) return { pairs: [], triplets: [] };

  const setW1 = buildDrawnSet(sorted, 1);
  const setW2 = buildDrawnSet(sorted, 2);
  const setW3 = buildDrawnSet(sorted, 3);

  const q1 = qualifyingInWindow(setW1);
  const q2 = qualifyingInWindow(setW2);
  const q3 = qualifyingInWindow(setW3);

  const pairs = groupByRemaining(dedupByEarliestWindow(q3.pairs, q2.pairs, q1.pairs)).sort(sortByEarliestThenBacking);
  const triplets = groupByRemaining(dedupByEarliestWindow(q3.triplets, q2.triplets, q1.triplets)).sort(sortByEarliestThenBacking);

  return { pairs, triplets };
}

module.exports = { computeRemainders, qualifyingInWindow, buildDrawnSet };
