const { sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');
const { analyzeZones } = require('./zone-analysis');
const { collectCrossEnginePredictions } = require('./cross-engine-predictions');

/**
 * "Hot" numbers are zone-analysis tier-1/tier-2 predictions that are ALSO
 * independently predicted by at least one pairwise engine (V1 Seq, V1 Fam,
 * or V2) - cross-engine agreement is the confirmation signal.
 */
function computeHotNumbers(draws) {
  const zones = analyzeZones(draws);
  const preds = collectCrossEnginePredictions(draws);
  const tier1 = (zones.tiers[1] || []).map((p) => p.num);
  const tier2 = (zones.tiers[2] || []).map((p) => p.num);

  const result = [];
  [...tier1, ...tier2].forEach((num) => {
    const sources = [];
    if (preds.seq.includes(num)) sources.push('V1 Seq');
    if (preds.fam.includes(num)) sources.push('V1 Fam');
    if (preds.v2.includes(num)) sources.push('V2');
    if (sources.length > 0) {
      result.push({ num, sources, zonePriority: tier1.includes(num) ? 1 : 2, count: sources.length + 1 });
    }
  });
  result.sort((a, b) => b.count - a.count || a.zonePriority - b.zonePriority);
  return result;
}

/** Just the number values - used by the performance backtest to lock a checkpoint's hot set. */
function getHotNumberValues(draws) {
  if (draws.length < 4) return [];
  try {
    return computeHotNumbers(draws).map((x) => x.num);
  } catch {
    return [];
  }
}

/**
 * Locks the hot-number set at the end of each day and scores it against
 * that day's actual next-day draws - a backtest of the hot-number signal
 * itself, mirroring computePairsTripletsPerformance's checkpoint replay.
 */
function computeHotNumbersPerformance(draws, limit = 30) {
  const sorted = sortDraws(draws);
  if (sorted.length < 5) return [];

  const dayMap = new Map();
  const dayList = [];
  sorted.forEach((d) => {
    if (!dayMap.has(d.drawDate)) {
      dayMap.set(d.drawDate, []);
      dayList.push(d.drawDate);
    }
    dayMap.get(d.drawDate).push(d);
  });

  const results = [];
  for (let di = 1; di < dayList.length; di++) {
    const prevDate = dayList[di - 1];
    let endOfPrevIdx = -1;
    for (let k = sorted.length - 1; k >= 0; k--) {
      if (sorted[k].drawDate === prevDate) { endOfPrevIdx = k; break; }
    }
    if (endOfPrevIdx < 0) continue;
    const prior = sorted.slice(0, endOfPrevIdx + 1);
    if (prior.length < 4) continue;
    const lockedHot = getHotNumberValues(prior);
    if (!lockedHot.length) continue;

    dayMap.get(dayList[di]).forEach((draw) => {
      const drawNums = drawValues(draw);
      const hits = lockedHot.filter((n) => drawNums.includes(n));
      results.push({
        drawDate: draw.drawDate,
        drawType: draw.drawType,
        hits,
        totalHot: lockedHot.length,
        hasHits: hits.length > 0,
        lockedFrom: prevDate,
      });
    });
  }
  return results.reverse().slice(0, limit);
}

module.exports = { computeHotNumbers, getHotNumberValues, computeHotNumbersPerformance };
