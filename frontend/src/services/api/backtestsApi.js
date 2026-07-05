import { httpClient } from './httpClient';

export const backtestsApi = {
  async getBacktestableEngines() {
    const { data } = await httpClient.get('/backtests/engines');
    return data;
  },
  async list() {
    const { data } = await httpClient.get('/backtests');
    return data;
  },
  async create(engineCode) {
    const { data } = await httpClient.post('/backtests', { engineCode });
    return data;
  },
  async getById(id) {
    const { data } = await httpClient.get(`/backtests/${id}`);
    return data;
  },
};
