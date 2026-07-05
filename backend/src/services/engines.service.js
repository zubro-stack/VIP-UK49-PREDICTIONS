const { ENGINE_CATALOG } = require('../engines/catalog');
const drawsRepository = require('../repositories/draws.repository');
const patternsRepository = require('../repositories/patterns.repository');
const { AppError } = require('../utils/AppError');

const DEFAULT_MAX_FAIL = 2;

function getCatalog() {
  return Object.entries(ENGINE_CATALOG).map(([code, meta]) => ({
    code,
    label: meta.label,
    category: meta.category,
    implemented: meta.implemented ?? Boolean(meta.engine),
  }));
}

function resolveEngine(code) {
  const meta = ENGINE_CATALOG[code];
  if (!meta) throw AppError.notFound(`Unknown engine "${code}"`);
  if (!meta.engine) throw AppError.badRequest(`Engine "${code}" is not implemented yet`, 'ENGINE_NOT_IMPLEMENTED');
  return meta.engine;
}

async function run(code) {
  const engine = resolveEngine(code);
  const draws = await drawsRepository.listForEngines();
  const discovered = engine.discover(draws);
  return patternsRepository.replaceEngineResults(code, discovered);
}

async function listCards(code) {
  const engine = resolveEngine(code);
  const [patterns, draws] = await Promise.all([
    patternsRepository.listByEngine(code, { status: 'active' }),
    drawsRepository.listForEngines(),
  ]);
  return engine.buildCards(draws, patterns);
}

async function getPatternDetail(code, id) {
  resolveEngine(code);
  const pattern = await patternsRepository.findById(code, id);
  if (!pattern) throw AppError.notFound('Pattern not found');
  return pattern;
}

async function recordMiss(code, id) {
  resolveEngine(code);
  const pattern = await patternsRepository.recordManualMiss(code, id, DEFAULT_MAX_FAIL);
  if (!pattern) throw AppError.notFound('Pattern not found');
  return pattern;
}

async function deletePattern(code, id) {
  resolveEngine(code);
  const result = await patternsRepository.remove(code, id);
  if (result.count === 0) throw AppError.notFound('Pattern not found');
}

module.exports = { getCatalog, run, listCards, getPatternDetail, recordMiss, deletePattern };
