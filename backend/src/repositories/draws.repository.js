const { prisma } = require('../config/db');

function list({ from, to, type } = {}) {
  return prisma.draw.findMany({
    where: {
      drawDate: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      drawType: type,
    },
    orderBy: [{ drawDate: 'asc' }, { drawType: 'asc' }],
  });
}

/** Every draw, shaped for the analysis engines (drawDate as YYYY-MM-DD string). */
async function listForEngines() {
  const draws = await prisma.draw.findMany({ orderBy: [{ drawDate: 'asc' }, { drawType: 'asc' }] });
  return draws.map((d) => ({ ...d, drawDate: d.drawDate.toISOString().slice(0, 10) }));
}

function create({ drawDate, drawType, numbers, bonus, source, createdBy }) {
  return prisma.draw.create({
    data: { drawDate: new Date(drawDate), drawType, numbers, bonus, source: source ?? 'manual', createdBy },
  });
}

function bulkCreate(rows, createdBy) {
  return prisma.draw.createMany({
    data: rows.map((r) => ({ ...r, drawDate: new Date(r.drawDate), source: 'import', createdBy })),
    skipDuplicates: true,
  });
}

function update(id, data) {
  return prisma.draw.update({ where: { id }, data });
}

function remove(id) {
  return prisma.draw.delete({ where: { id } });
}

module.exports = { list, listForEngines, create, bulkCreate, update, remove };
