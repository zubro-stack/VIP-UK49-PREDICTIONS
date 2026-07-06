const usersRepository = require('../repositories/users.repository');
const dailyTripletService = require('../services/daily-triplet.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/AppError');

const get = asyncHandler(async (req, res) => {
  const user = await usersRepository.findById(req.user.id);
  if (!user) throw AppError.unauthorized('Account no longer exists');
  res.json(await dailyTripletService.getForUser(user));
});

module.exports = { get };
