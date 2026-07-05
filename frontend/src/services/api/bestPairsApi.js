import { httpClient } from './httpClient';

export const bestPairsApi = {
  async analyze(numbers, size) {
    const { data } = await httpClient.post('/best-pairs/analyze', { numbers, size });
    return data;
  },
};
