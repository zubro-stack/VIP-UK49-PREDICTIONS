const usersService = require('../services/users.service');
const { asyncHandler } = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => res.json(await usersService.list()));

const create = asyncHandler(async (req, res) => res.status(201).json(await usersService.create(req.body)));

const update = asyncHandler(async (req, res) => res.json(await usersService.update(req.params.id, req.body)));

const updateRole = asyncHandler(async (req, res) =>
  res.json(await usersService.updateRole(req.params.id, req.body.role)));

const remove = asyncHandler(async (req, res) => {
  await usersService.remove(req.params.id);
  res.status(204).send();
});

module.exports = { list, create, update, updateRole, remove };
