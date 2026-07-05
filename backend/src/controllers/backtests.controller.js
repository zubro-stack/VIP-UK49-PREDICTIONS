const backtestsService = require('../services/backtests.service');
const { asyncHandler } = require('../utils/asyncHandler');

const create = asyncHandler(async (req, res) => {
  const run = await backtestsService.create(req.body.engineCode, req.user.id);
  res.status(201).json(run);
});

const list = asyncHandler(async (req, res) => res.json(await backtestsService.list()));

const getById = asyncHandler(async (req, res) => res.json(await backtestsService.getById(req.params.id)));

const listBacktestableEngines = asyncHandler(async (req, res) => res.json(backtestsService.BACKTESTABLE_CODES));

module.exports = { create, list, getById, listBacktestableEngines };
