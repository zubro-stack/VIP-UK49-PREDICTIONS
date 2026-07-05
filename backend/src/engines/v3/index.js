const { NUMBER_GROUPS, ZONE_WINDOW } = require('./chart');
const { analyzeZones } = require('./zone-analysis');
const { computeRemainders } = require('./remainders');
const { computePairsTripletsPerformance } = require('./locked-sets');
const { computeHotNumbers, computeHotNumbersPerformance } = require('./hot-numbers');
const { computeChartPredictions } = require('./chart-predictions');
const { computeCommonNumbers } = require('./common-numbers');
const { collectCrossEnginePredictions } = require('./cross-engine-predictions');
const { sortDraws } = require('../core/draw-utils');
const { drawValues } = require('../core/lottery-math');

/**
 * V3 ("Zubro Tracker") bundles six analyses that all read the same fixed
 * 50-line number chart and the current draw history - this is the single
 * entry point the API and frontend consume, one computation pass instead
 * of six separate round trips.
 */
function computeV3Analysis(draws) {
  if (!draws.length) {
    return {
      zoneAnalysis: { targetLines: [], predictions: [], tiers: { 1: [], 2: [], 3: [] } },
      remainders: { pairs: [], triplets: [] },
      pairsTripletsPerformance: { pairRows: [], tripletRows: [] },
      hotNumbers: [],
      hotNumbersPerformance: [],
      chartPredictions: [],
      commonNumbers: [],
      stats: { activeLines: 0, totalLines: NUMBER_GROUPS.length, window: ZONE_WINDOW },
    };
  }

  const sorted = sortDraws(draws);
  const zoneAnalysis = analyzeZones(sorted);
  const remainders = computeRemainders(sorted);
  const pairsTripletsPerformance = computePairsTripletsPerformance(sorted);
  // Computed once and shared: computeHotNumbers and computeCommonNumbers both
  // need the same v1-seq/v1-fam/v2 cross-reference, which is itself a full
  // discover()+buildCards() pass per engine - not worth running twice.
  const crossEnginePredictions = collectCrossEnginePredictions(sorted);
  const hotNumbers = computeHotNumbers(sorted, crossEnginePredictions);
  const hotNumbersPerformance = computeHotNumbersPerformance(sorted);
  const chartPredictions = computeChartPredictions(hotNumbers);
  const commonNumbers = computeCommonNumbers(crossEnginePredictions);

  const activeSet = new Set();
  sorted.slice(-ZONE_WINDOW).forEach((d) => drawValues(d).forEach((n) => activeSet.add(n)));
  const activeLines = NUMBER_GROUPS.filter((g) => g.some((n) => activeSet.has(n))).length;

  return {
    zoneAnalysis,
    remainders,
    pairsTripletsPerformance,
    hotNumbers,
    hotNumbersPerformance,
    chartPredictions,
    commonNumbers,
    stats: { activeLines, totalLines: NUMBER_GROUPS.length, window: ZONE_WINDOW },
  };
}

module.exports = { computeV3Analysis };
