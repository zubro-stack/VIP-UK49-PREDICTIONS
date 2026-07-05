const { prisma } = require('../config/db');

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function list() {
  return prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
}

function create({ email, passwordHash, displayName, role }) {
  return prisma.user.create({ data: { email, passwordHash, displayName, role } });
}

function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

function updateRole(id, role) {
  return prisma.user.update({ where: { id }, data: { role } });
}

function remove(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = { findByEmail, findById, list, create, update, updateRole, remove };
