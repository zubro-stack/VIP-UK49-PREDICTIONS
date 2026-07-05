import { httpClient } from './httpClient';

export const postsApi = {
  async list() {
    const { data } = await httpClient.get('/posts');
    return data;
  },
  async create(post) {
    const { data } = await httpClient.post('/posts', post);
    return data;
  },
  async remove(id) {
    await httpClient.delete(`/posts/${id}`);
  },
};
