const postsRepository = require('../repositories/posts.repository');
const { AppError } = require('../utils/AppError');

function list() {
  return postsRepository.list();
}

function create(data, authorId) {
  return postsRepository.create({ ...data, authorId });
}

async function remove(id, actor) {
  const post = await postsRepository.findById(id);
  if (!post) throw AppError.notFound('Post not found');
  if (post.authorId !== actor.id && actor.role !== 'admin') {
    throw AppError.forbidden('Only the author or an admin can delete this post');
  }
  await postsRepository.remove(id);
}

module.exports = { list, create, remove };
