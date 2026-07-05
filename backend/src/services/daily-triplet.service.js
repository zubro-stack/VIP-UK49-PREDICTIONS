const { prisma } = require('../config/db');
const { computeDailyTriplet, TOTAL_TRIPLETS } = require('../engines/daily-triplet/daily-triplet');

/**
 * Everyone whose slot lands on the same combination as `dailySlot` today
 * shares this user's triplet - two slots exactly TOTAL_TRIPLETS apart
 * always coincide, so this counts users at every such offset via modular
 * arithmetic in SQL (a plain equality check can't express "same value
 * mod N" in Prisma's query builder).
 */
async function countSharingSlot(dailySlot) {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count FROM "users"
    WHERE MOD("daily_slot" - 1, ${TOTAL_TRIPLETS}) = MOD(${dailySlot}::int - 1, ${TOTAL_TRIPLETS})
  `;
  return rows[0]?.count ?? 1;
}

async function getForUser(user) {
  const { triplet } = computeDailyTriplet(user.dailySlot);
  const sharingCount = await countSharingSlot(user.dailySlot);
  return { triplet, slot: user.dailySlot, sharingCount, date: new Date().toISOString().slice(0, 10) };
}

module.exports = { getForUser };
