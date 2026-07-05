import { httpClient } from './httpClient';

export const repeatsApi = {
  async getLive() {
    const { data } = await httpClient.get('/repeats/live');
    return data;
  },
  async getPerformance() {
    const { data } = await httpClient.get('/repeats/performance');
    return data;
  },
};
