const usersRepository = require('../repositories/users.repository');
const dailyTripletService = require('../services/daily-triplet.service');
const { asyncHandler } = require('../utils/asyncHandler');

const get = asyncHandler(async (req, res) => {
  const user = await usersRepository.findById(req.user.id);
  res.json(await dailyTripletService.getForUser(user));
});

module.exports = { get };
