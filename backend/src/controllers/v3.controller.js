const v3Service = require('../services/v3.service');
const { asyncHandler } = require('../utils/asyncHandler');

const getAnalysis = asyncHandler(async (req, res) => res.json(await v3Service.getAnalysis()));

module.exports = { getAnalysis };
