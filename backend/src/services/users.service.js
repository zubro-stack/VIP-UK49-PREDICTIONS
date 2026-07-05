const usersRepository = require('../repositories/users.repository');
const authService = require('./auth.service');
const { AppError } = require('../utils/AppError');

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function list() {
  return (await usersRepository.list()).map(sanitize);
}

async function create({ email, password, displayName, role }) {
  const existing = await usersRepository.findByEmail(email);
  if (existing) throw AppError.conflict('A user with this email already exists');
  const passwordHash = await authService.hashPassword(password);
  const user = await usersRepository.create({ email, passwordHash, displayName, role });
  return sanitize(user);
}

async function update(id, data, actor) {
  if (actor.id === id && data.isActive === false) {
    throw AppError.forbidden('You cannot deactivate your own account');
  }
  const user = await usersRepository.update(id, data);
  return sanitize(user);
}

async function updateRole(id, role, actor) {
  if (actor.id === id) {
    throw AppError.forbidden('You cannot change your own role');
  }
  const user = await usersRepository.updateRole(id, role);
  return sanitize(user);
}

async function remove(id, actor) {
  if (actor.id === id) {
    throw AppError.forbidden('You cannot delete your own account');
  }
  await usersRepository.remove(id);
}

module.exports = { list, create, update, updateRole, remove, sanitize };
