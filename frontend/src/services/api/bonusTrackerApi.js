import { httpClient } from './httpClient';

export const bonusTrackerApi = {
  async getPage() {
    const { data } = await httpClient.get('/bonus-tracker');
    return data;
  },
  async run() {
    const { data } = await httpClient.post('/bonus-tracker/run');
    return data;
  },
};
