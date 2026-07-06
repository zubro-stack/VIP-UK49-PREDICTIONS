const { strat1, strat2, strat3 } = require('./strategies');
const { drawValues } = require('../core/lottery-math');

const TRACKED_DATES = 10;

function makeAccumulator(positions) {
  return {
    analyzed: 0,
    multi2: 0,
    multi3: 0,
    totalHits: 0,
    posHits: new Array(positions).fill(0),
    posTried: new Array(positions).fill(0),
    history: [],
  };
}

/** `predictions` must already be truncated to acc's position count by the caller (e.g. strat3's variable-length output). */
function accumulate(acc, predictions, targetValues) {
  acc.analyzed++;
  let hits = 0;
  const posHit = [];
  predictions.forEach((n, i) => {
    acc.posTried[i]++;
    const hit = n !== null && targetValues.includes(n);
    posHit.push(hit);
    if (hit) {
      acc.posHits[i]++;
      acc.totalHits++;
      hits++;
    }
  });
  if (hits >= 2) acc.multi2++;
  if (hits >= 3) acc.multi3++;
  acc.history.push({ hits, posHit });
}

/**
 * Historical accuracy of the three strategies over the last 10 recorded
 * calendar dates: for each date that has a "next recorded date" (the next
 * date with any draw, not necessarily the next calendar day - gaps are
 * skipped, not treated as a miss), predictions from that date's Lunch are
 * checked against the next Lunch, and predictions from that date's Tea
 * against the next Tea (same draw type only, unlike the live calculator
 * which also reports cross-type "other" hits).
 */
function computeTrackerStats(draws) {
  if (!draws.length) return null;

  const dateSet = new Set(draws.map((d) => d.drawDate));
  const dates = [...dateSet].sort().slice(-TRACKED_DATES);

  const acc = {
    s1l: makeAccumulator(6), s1t: makeAccumulator(6),
    s2l: makeAccumulator(6), s2t: makeAccumulator(6),
    s3l: makeAccumulator(6), s3t: makeAccumulator(6),
  };

  dates.forEach((date, di) => {
    const nextDate = dates[di + 1] || null;
    if (!nextDate) return;

    const lunch = draws.find((d) => d.drawDate === date && d.drawType === 'lunch') || null;
    const tea = draws.find((d) => d.drawDate === date && d.drawType === 'tea') || null;
    const nL = draws.find((d) => d.drawDate === nextDate && d.drawType === 'lunch') || null;
    const nT = draws.find((d) => d.drawDate === nextDate && d.drawType === 'tea') || null;
    if (!nL && !nT) return;

    const nLValues = nL ? drawValues(nL) : [];
    const nTValues = nT ? drawValues(nT) : [];

    function check(source, accS1, accS2, accS3, targetValues) {
      if (!source) return;
      accumulate(accS1, strat1(source.numbers), targetValues);
      accumulate(accS2, strat2(source.numbers), targetValues);
      if (source.bonus != null) accumulate(accS3, strat3(source.bonus).slice(0, 6), targetValues);
    }

    check(lunch, acc.s1l, acc.s2l, acc.s3l, nLValues);
    check(tea, acc.s1t, acc.s2t, acc.s3t, nTValues);
  });

  return acc;
}

module.exports = { computeTrackerStats, TRACKED_DATES };
