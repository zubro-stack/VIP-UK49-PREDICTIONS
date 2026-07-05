const calcService = require('../services/calc.service');
const { asyncHandler } = require('../utils/asyncHandler');

const getResult = asyncHandler(async (req, res) => {
  const { lunchDrawId, teaDrawId } = req.query;
  res.json(await calcService.getResult({ lunchDrawId, teaDrawId }));
});

const getTracker = asyncHandler(async (req, res) => res.json(await calcService.getTracker()));

module.exports = { getResult, getTracker };
