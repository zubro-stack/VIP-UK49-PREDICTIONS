import { httpClient } from './httpClient';

export const enginesApi = {
  async getCatalog() {
    const { data } = await httpClient.get('/engines');
    return data;
  },
  async getPatterns(code) {
    const { data } = await httpClient.get(`/engines/${code}/patterns`);
    return data;
  },
  async getPattern(code, id) {
    const { data } = await httpClient.get(`/engines/${code}/patterns/${id}`);
    return data;
  },
  async run(code) {
    const { data } = await httpClient.post(`/engines/${code}/run`);
    return data;
  },
  async recordMiss(code, id) {
    const { data } = await httpClient.patch(`/engines/${code}/patterns/${id}/miss`);
    return data;
  },
  async deletePattern(code, id) {
    await httpClient.delete(`/engines/${code}/patterns/${id}`);
  },
};
