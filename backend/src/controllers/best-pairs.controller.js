const { findBestCombos } = require('../engines/best-pairs/best-pairs-engine');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const analyze = asyncHandler(async (req, res) => {
  const { numbers, size } = req.body;
  if (numbers.length < size) {
    throw AppError.badRequest(`Select at least ${size} numbers`);
  }
  const combos = findBestCombos(numbers, size);
  res.json({ combos, userNumbers: numbers, size });
});

module.exports = { analyze };
