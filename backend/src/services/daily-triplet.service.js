const { prisma } = require('../config/db');
const { computeDailyTriplet } = require('../engines/daily-triplet/daily-triplet');

/**
 * Everyone whose slot lands on the same combination as `dailySlot` today
 * shares this user's triplet. Two slots exactly TOTAL_TRIPLETS (18424)
 * apart would technically coincide too, but at realistic signup counts
 * (nowhere near 18424 users) that can't happen yet, so a plain equality
 * check - which can use the unique index on daily_slot - is both correct
 * and fast today. Revisit with a modular query (and a test for it) once
 * the user count approaches TOTAL_TRIPLETS.
 */
async function countSharingSlot(dailySlot) {
  return prisma.user.count({ where: { dailySlot } });
}

async function getForUser(user) {
  const { triplet } = computeDailyTriplet(user.dailySlot);
  const sharingCount = await countSharingSlot(user.dailySlot);
  return { triplet, slot: user.dailySlot, sharingCount, date: new Date().toISOString().slice(0, 10) };
}

module.exports = { getForUser };
