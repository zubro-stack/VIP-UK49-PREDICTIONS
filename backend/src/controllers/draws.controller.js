const drawsService = require('../services/draws.service');
const { asyncHandler } = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => res.json(await drawsService.list(req.query)));

const create = asyncHandler(async (req, res) =>
  res.status(201).json(await drawsService.create(req.body, req.user.id)));

const importBulk = asyncHandler(async (req, res) => {
  const result = await drawsService.importBulk(req.body.draws, req.user.id);
  res.status(201).json(result);
});

const update = asyncHandler(async (req, res) => res.json(await drawsService.update(req.params.id, req.body)));

const remove = asyncHandler(async (req, res) => {
  await drawsService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, create, importBulk, update, remove };
