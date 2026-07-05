import { httpClient } from './httpClient';

export const usersApi = {
  async list() {
    const { data } = await httpClient.get('/users');
    return data;
  },
  async create(user) {
    const { data } = await httpClient.post('/users', user);
    return data;
  },
  async updateRole(id, role) {
    const { data } = await httpClient.patch(`/users/${id}/role`, { role });
    return data;
  },
  async update(id, changes) {
    const { data } = await httpClient.patch(`/users/${id}`, changes);
    return data;
  },
  async remove(id) {
    await httpClient.delete(`/users/${id}`);
  },
};
