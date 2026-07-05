import { httpClient } from './httpClient';

export const v3Api = {
  async getAnalysis() {
    const { data } = await httpClient.get('/v3/analysis');
    return data;
  },
};
