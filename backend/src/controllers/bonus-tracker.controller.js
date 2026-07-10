const bonusTrackerService = require('../services/bonus-tracker.service');
const { asyncHandler } = require('../utils/asyncHandler');

const getPage = asyncHandler(async (req, res) => res.json(await bonusTrackerService.getPage()));

const run = asyncHandler(async (req, res) => res.status(202).json(await bonusTrackerService.runAll()));

module.exports = { getPage, run };
