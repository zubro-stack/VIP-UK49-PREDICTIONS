const drawsRepository = require('../repositories/draws.repository');
const { computeV3Analysis } = require('../engines/v3');

async function getAnalysis() {
  const draws = await drawsRepository.listForEngines();
  return computeV3Analysis(draws);
}

module.exports = { getAnalysis };
