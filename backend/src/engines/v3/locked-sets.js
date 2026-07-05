const { NUMBER_GROUPS } = require('./chart');
const { sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

function buildSetAt(sortedDraws, asOfIdx, window) {
  const set = new Set();
  const from = Math.max(0, asOfIdx + 1 - window);
  for (let i = from; i <= asOfIdx; i++) drawValues(sortedDraws[i]).forEach((n) => set.add(n));
  return set;
}

/**
 * Same pairs/triplets-remaining-to-complete-a-line detection as
 * remainders.js, but "as of" a specific historical index rather than the
 * live end of the draw list - this is what lets performance backtesting
 * replay what would have been predicted at any past checkpoint.
 */
function buildLockedSets(asOfIdx, sortedDraws) {
  const available = asOfIdx + 1;
  const windows = [];
  if (available >= 1) windows.push({ win: 1, drawnSet: buildSetAt(sortedDraws, asOfIdx, 1) });
  if (available >= 2) windows.push({ win: 2, drawnSet: buildSetAt(sortedDraws, asOfIdx, 2) });
  if (available >= 3) windows.push({ win: 3, drawnSet: buildSetAt(sortedDraws, asOfIdx, 3) });
  if (!windows.length) return { lockedPairs: [], lockedTriplets: [] };

  const pairsMap = {};
  const tripletsMap = {};
  windows.forEach(({ win, drawnSet }) => {
    NUMBER_GROUPS.forEach((line, lineIdx) => {
      const remaining = line.filter((n) => !drawnSet.has(n));
      const hit = line.filter((n) => drawnSet.has(n));
      if (hit.length === 0) return;
      const key = remaining.slice().sort((a, b) => a - b).join('-');
      const map = remaining.length === 2 ? pairsMap : remaining.length === 3 ? tripletsMap : null;
      if (!map) return;
      if (!map[key]) {
        map[key] = { remaining: remaining.slice().sort((a, b) => a - b), lines: [], lineIdxs: [], earliestWin: win, line, lineIdx, hit };
      } else if (win > map[key].earliestWin) {
        map[key].earliestWin = win;
      }
      if (!map[key].lineIdxs.includes(lineIdx)) {
        map[key].lines.push(line);
        map[key].lineIdxs.push(lineIdx);
      }
    });
  });

  const toLocked = (map) => Object.values(map).map((g) => ({ ...g, backingCount: g.lines.length }));
  return { lockedPairs: toLocked(pairsMap), lockedTriplets: toLocked(tripletsMap) };
}

/**
 * Replays buildLockedSets at every historical checkpoint and scores the
 * locked-in pairs/triplets against what was actually drawn next, at two
 * checkpoint types:
 *  1) End-of-day (both Lunch+Tea in) -> scored against the next calendar
 *     day's draws.
 *  2) Same-day Lunch only -> scored against that same day's Tea draw
 *     (catches same-day hits, not just next-day ones).
 */
function computePairsTripletsPerformance(draws, limit = 30) {
  const sorted = sortDraws(draws);
  if (sorted.length < 2) return { pairRows: [], tripletRows: [] };

  const pairRows = [];
  const tripletRows = [];
  const dayMap = new Map();
  const dayList = [];
  sorted.forEach((d) => {
    if (!dayMap.has(d.drawDate)) {
      dayMap.set(d.drawDate, []);
      dayList.push(d.drawDate);
    }
    dayMap.get(d.drawDate).push(d);
  });

  function scoreAgainst(lockedPairs, lockedTriplets, targetDraws, lockedFromLabel) {
    targetDraws.forEach((draw) => {
      const drawSet = new Set(drawValues(draw));
      if (lockedPairs.length > 0) {
        const hits = lockedPairs.filter((p) => p.remaining.every((n) => drawSet.has(n)));
        pairRows.push({ drawDate: draw.drawDate, drawType: draw.drawType, total: lockedPairs.length, hits, lockedFrom: lockedFromLabel });
      }
      if (lockedTriplets.length > 0) {
        const hits = lockedTriplets.filter((t) => t.remaining.every((n) => drawSet.has(n)));
        tripletRows.push({ drawDate: draw.drawDate, drawType: draw.drawType, total: lockedTriplets.length, hits, lockedFrom: lockedFromLabel });
      }
    });
  }

  // Checkpoint 1: end-of-day -> next calendar day.
  for (let di = 1; di < dayList.length; di++) {
    const prevDate = dayList[di - 1];
    let endIdx = -1;
    for (let k = sorted.length - 1; k >= 0; k--) {
      if (sorted[k].drawDate === prevDate) { endIdx = k; break; }
    }
    if (endIdx < 0) continue;
    const locked = buildLockedSets(endIdx, sorted);
    if (!locked.lockedPairs.length && !locked.lockedTriplets.length) continue;
    scoreAgainst(locked.lockedPairs, locked.lockedTriplets, dayMap.get(dayList[di]), prevDate);
  }

  // Checkpoint 2: same-day Lunch -> that day's Tea.
  dayList.forEach((date) => {
    let lunchIdx = -1;
    let teaDraw = null;
    sorted.forEach((dr, idx) => {
      if (dr.drawDate === date && dr.drawType === 'lunch') lunchIdx = idx;
      if (dr.drawDate === date && dr.drawType === 'tea') teaDraw = dr;
    });
    if (lunchIdx < 0 || !teaDraw) return;
    const locked = buildLockedSets(lunchIdx, sorted);
    if (!locked.lockedPairs.length && !locked.lockedTriplets.length) return;
    scoreAgainst(locked.lockedPairs, locked.lockedTriplets, [teaDraw], `${date} (Lunch)`);
  });

  return {
    pairRows: pairRows.reverse().slice(0, limit),
    tripletRows: tripletRows.reverse().slice(0, limit),
  };
}

module.exports = { buildLockedSets, computePairsTripletsPerformance };
