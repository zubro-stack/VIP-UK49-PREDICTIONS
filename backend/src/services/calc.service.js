const drawsRepository = require('../repositories/draws.repository');
const { computeCalcResult } = require('../engines/calc/calc-engine');
const { computeTrackerStats } = require('../engines/calc/tracker');

async function getResult({ lunchDrawId, teaDrawId } = {}) {
  const draws = await drawsRepository.listForEngines();
  return computeCalcResult(draws, { lunchDrawId, teaDrawId });
}

async function getTracker() {
  const draws = await drawsRepository.listForEngines();
  return computeTrackerStats(draws);
}

module.exports = { getResult, getTracker };
