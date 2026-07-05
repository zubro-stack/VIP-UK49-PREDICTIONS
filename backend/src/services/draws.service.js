const drawsRepository = require('../repositories/draws.repository');
const { AppError } = require('../utils/AppError');

function isUniqueViolation(err) {
  return err?.code === 'P2002';
}

async function list(filters) {
  return drawsRepository.list(filters);
}

async function create(data, userId) {
  try {
    return await drawsRepository.create({ ...data, createdBy: userId });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw AppError.conflict(`A ${data.drawType} draw already exists for ${data.drawDate}`);
    }
    throw err;
  }
}

async function importBulk(draws, userId) {
  return drawsRepository.bulkCreate(draws, userId);
}

async function update(id, data) {
  return drawsRepository.update(id, data);
}

async function remove(id) {
  await drawsRepository.remove(id);
}

module.exports = { list, create, importBulk, update, remove };
