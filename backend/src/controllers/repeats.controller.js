const repeatsService = require('../services/repeats.service');
const { asyncHandler } = require('../utils/asyncHandler');

const getLive = asyncHandler(async (req, res) => res.json(await repeatsService.getLive()));

const getPerformance = asyncHandler(async (req, res) => res.json(await repeatsService.getPerformance()));

module.exports = { getLive, getPerformance };
