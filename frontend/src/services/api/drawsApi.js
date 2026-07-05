import { httpClient } from './httpClient';

export const drawsApi = {
  async list(filters = {}) {
    const { data } = await httpClient.get('/draws', { params: filters });
    return data;
  },
  async create(draw) {
    const { data } = await httpClient.post('/draws', draw);
    return data;
  },
};
