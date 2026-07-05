const enginesService = require('../services/engines.service');
const { asyncHandler } = require('../utils/asyncHandler');

const listCatalog = asyncHandler(async (req, res) => res.json(enginesService.getCatalog()));

const run = asyncHandler(async (req, res) => {
  const patterns = await enginesService.run(req.params.code);
  res.status(202).json({ patternCount: patterns.length });
});

const listPatterns = asyncHandler(async (req, res) => res.json(await enginesService.listCards(req.params.code)));

const getPattern = asyncHandler(async (req, res) =>
  res.json(await enginesService.getPatternDetail(req.params.code, req.params.id)));

const recordMiss = asyncHandler(async (req, res) =>
  res.json(await enginesService.recordMiss(req.params.code, req.params.id)));

const deletePattern = asyncHandler(async (req, res) => {
  await enginesService.deletePattern(req.params.code, req.params.id);
  res.status(204).send();
});

module.exports = { listCatalog, run, listPatterns, getPattern, recordMiss, deletePattern };
