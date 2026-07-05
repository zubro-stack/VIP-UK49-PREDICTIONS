const { prisma } = require('../config/db');

function list() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { displayName: true } } },
  });
}

function create({ authorId, title, target, numbers, notes }) {
  return prisma.post.create({ data: { authorId, title, target, numbers, notes } });
}

function findById(id) {
  return prisma.post.findUnique({ where: { id } });
}

function remove(id) {
  return prisma.post.delete({ where: { id } });
}

module.exports = { list, create, findById, remove };
