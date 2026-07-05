const drawsRepository = require('../repositories/draws.repository');
const { computeRepeats, computeRepeatsPerformance } = require('../engines/repeats/repeats-engine');

async function getLive() {
  const draws = await drawsRepository.listForEngines();
  try {
    return computeRepeats(draws);
  } catch (err) {
    return { predictions: [], history: {}, windowSize: 0, error: err.message };
  }
}

async function getPerformance() {
  const draws = await drawsRepository.listForEngines();
  return computeRepeatsPerformance(draws);
}

module.exports = { getLive, getPerformance };
