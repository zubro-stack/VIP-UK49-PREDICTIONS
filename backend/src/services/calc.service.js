const drawsRepository = require('../repositories/draws.repository');
const { computeCalcResult } = require('../engines/calc/calc-engine');
const { computeTrackerStats } = require('../engines/calc/tracker');

/** Fetches the draw history once and derives both the live result and the tracker from it, instead of two separate full-table fetches. */
async function getPage({ lunchDrawId, teaDrawId } = {}) {
  const draws = await drawsRepository.listForEngines();
  return {
    result: computeCalcResult(draws, { lunchDrawId, teaDrawId }),
    tracker: computeTrackerStats(draws),
  };
}

module.exports = { getPage };
