const { pairwiseEngines } = require('../pairwise');
const { runPairwiseBacktest } = require('./pairwise-backtest');
const { computeRepeatsPerformance } = require('../repeats/repeats-engine');
const { computeV3Analysis } = require('../v3');
const { computeTrackerStats } = require('../calc/tracker');

const PAIRWISE_CODES = Object.keys(pairwiseEngines);
const BACKTESTABLE_CODES = [...PAIRWISE_CODES, 'repeats', 'v3', 'calc'];
const CALC_TRACKER_KEYS = ['s1l', 's1t', 's2l', 's2t', 's3l', 's3t'];

function summarize(rows, hitsOf) {
  const totalPredictions = rows.reduce((a, r) => a + r.total, 0);
  const totalHits = rows.reduce((a, r) => a + hitsOf(r), 0);
  return {
    checkpointCount: rows.length,
    totalPredictions,
    totalHits,
    overallHitRate: totalPredictions ? totalHits / totalPredictions : null,
  };
}

/**
 * One dispatcher, three underlying replay strategies: the 7 pairwise
 * engines get a brand-new generic checkpoint replay (pairwise-backtest.js)
 * since none of them had any performance measurement before. Repeats and
 * V3 already carry their own built-in checkpoint-replay logic (ported
 * alongside their discovery logic), so this just exposes their existing
 * performance functions through the same run/summary/breakdown shape.
 */
function runBacktest(engineCode, draws) {
  if (PAIRWISE_CODES.includes(engineCode)) {
    const { checkpoints, summary } = runPairwiseBacktest(engineCode, draws);
    return { summary, breakdown: checkpoints };
  }

  if (engineCode === 'repeats') {
    const rows = computeRepeatsPerformance(draws);
    return { summary: summarize(rows, (r) => r.hits.length), breakdown: rows };
  }

  if (engineCode === 'v3') {
    const { pairsTripletsPerformance } = computeV3Analysis(draws);
    const rows = [...pairsTripletsPerformance.pairRows, ...pairsTripletsPerformance.tripletRows];
    return { summary: summarize(rows, (r) => r.hits.length), breakdown: rows };
  }

  if (engineCode === 'calc') {
    const stats = computeTrackerStats(draws);
    if (!stats) return { summary: { checkpointCount: 0, totalPredictions: 0, totalHits: 0, overallHitRate: null }, breakdown: [] };
    const breakdown = CALC_TRACKER_KEYS.map((key) => ({ key, ...stats[key] }));
    const totalPredictions = breakdown.reduce((a, s) => a + s.posTried.reduce((x, y) => x + y, 0), 0);
    const totalHits = breakdown.reduce((a, s) => a + s.totalHits, 0);
    const checkpointCount = Math.max(0, ...breakdown.map((s) => s.analyzed));
    return {
      summary: { checkpointCount, totalPredictions, totalHits, overallHitRate: totalPredictions ? totalHits / totalPredictions : null },
      breakdown,
    };
  }

  throw new Error(`Backtesting is not available for engine "${engineCode}"`);
}

module.exports = { runBacktest, BACKTESTABLE_CODES };
