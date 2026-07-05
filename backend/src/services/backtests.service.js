const { prisma } = require('../config/db');
const drawsRepository = require('../repositories/draws.repository');
const { runBacktest, BACKTESTABLE_CODES } = require('../engines/backtest');
const { AppError } = require('../utils/AppError');

async function create(engineCode, requestedBy) {
  if (!BACKTESTABLE_CODES.includes(engineCode)) {
    throw AppError.badRequest(`Backtesting is not available for engine "${engineCode}"`, 'ENGINE_NOT_BACKTESTABLE');
  }

  const run = await prisma.backtestRun.create({
    data: { engineCode, requestedBy, params: {}, status: 'running' },
  });

  try {
    const draws = await drawsRepository.listForEngines();
    const { summary, breakdown } = runBacktest(engineCode, draws);

    await prisma.backtestResult.createMany({
      data: [
        { runId: run.id, metricName: 'overallHitRate', metricValue: summary.overallHitRate ?? 0 },
        { runId: run.id, metricName: 'totalPredictions', metricValue: summary.totalPredictions },
        { runId: run.id, metricName: 'totalHits', metricValue: summary.totalHits },
        { runId: run.id, metricName: 'checkpointCount', metricValue: summary.checkpointCount, breakdown: { rows: breakdown } },
      ],
    });

    return prisma.backtestRun.update({
      where: { id: run.id },
      data: { status: 'done', finishedAt: new Date() },
      include: { results: true },
    });
  } catch (err) {
    await prisma.backtestRun.update({ where: { id: run.id }, data: { status: 'failed', finishedAt: new Date() } });
    throw err;
  }
}

function list() {
  return prisma.backtestRun.findMany({
    orderBy: { createdAt: 'desc' },
    include: { requester: { select: { displayName: true } } },
  });
}

async function getById(id) {
  const run = await prisma.backtestRun.findUnique({ where: { id }, include: { results: true } });
  if (!run) throw AppError.notFound('Backtest run not found');
  return run;
}

module.exports = { create, list, getById, BACKTESTABLE_CODES };
