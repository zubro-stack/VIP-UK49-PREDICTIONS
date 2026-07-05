const postsService = require('../services/posts.service');
const { asyncHandler } = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => res.json(await postsService.list()));

const create = asyncHandler(async (req, res) => res.status(201).json(await postsService.create(req.body, req.user.id)));

const remove = asyncHandler(async (req, res) => {
  await postsService.remove(req.params.id, req.user);
  res.status(204).send();
});

module.exports = { list, create, remove };
