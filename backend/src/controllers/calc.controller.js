const calcService = require('../services/calc.service');
const { asyncHandler } = require('../utils/asyncHandler');

const getPage = asyncHandler(async (req, res) => {
  const { lunchDrawId, teaDrawId } = req.query;
  res.json(await calcService.getPage({ lunchDrawId, teaDrawId }));
});

module.exports = { getPage };
