const { prisma } = require('../config/db');

/**
 * Replaces the full pattern set for one engine with a freshly discovered
 * set, inside a transaction: delete-then-recreate is simpler and safer
 * than diffing, since discover() is a pure recomputation from the draws
 * table (patterns/history are a derived cache, not a source of truth).
 */
async function replaceEngineResults(engineCode, discoveredPatterns) {
  return prisma.$transaction(async (tx) => {
    await tx.pattern.deleteMany({ where: { engineCode } });
    for (const p of discoveredPatterns) {
      await tx.pattern.create({
        data: {
          engineCode,
          drawType: p.drawType ?? null,
          positionA: p.positionA,
          positionB: p.positionB,
          extra: p.extra ?? {},
          status: p.status,
          occurrences: p.occurrences,
          failures: p.failures,
          streak: 0,
          history: {
            create: p.history
              .filter((h) => h.sourceDrawId)
              .map((h) => ({
                sourceDrawId: h.sourceDrawId,
                targetDrawId: h.targetDrawId ?? null,
                addPreds: h.addPreds,
                subPreds: h.subPreds,
                addHit: h.addHit,
                subHit: h.subHit,
                hit: h.hit,
                addDirectHit: h.addDirectHit ?? null,
                subDirectHit: h.subDirectHit ?? null,
              })),
          },
        },
      });
    }
    return tx.pattern.findMany({ where: { engineCode }, include: { history: true } });
  });
}

function listByEngine(engineCode, { status } = {}) {
  return prisma.pattern.findMany({
    where: { engineCode, status },
    include: { history: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
}

function findById(engineCode, id) {
  return prisma.pattern.findFirst({
    where: { id, engineCode },
    include: { history: { orderBy: { createdAt: 'asc' }, include: { sourceDraw: true, targetDraw: true } } },
  });
}

/** Manual miss: bumps the failure streak by one, same effect as a real observed miss. */
async function recordManualMiss(engineCode, id, maxFail) {
  const pattern = await prisma.pattern.findFirst({ where: { id, engineCode } });
  if (!pattern) return null;
  const failures = pattern.failures + 1;
  const status = failures >= maxFail ? 'failed' : 'warning';
  return prisma.pattern.update({ where: { id }, data: { failures, status } });
}

function remove(engineCode, id) {
  return prisma.pattern.deleteMany({ where: { id, engineCode } });
}

module.exports = { replaceEngineResults, listByEngine, findById, recordManualMiss, remove };
