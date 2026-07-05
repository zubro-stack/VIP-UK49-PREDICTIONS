import { httpClient } from './httpClient';

export const calcApi = {
  async getResult({ lunchDrawId, teaDrawId } = {}) {
    const { data } = await httpClient.get('/calc/result', { params: { lunchDrawId, teaDrawId } });
    return data;
  },
  async getTracker() {
    const { data } = await httpClient.get('/calc/tracker');
    return data;
  },
};
