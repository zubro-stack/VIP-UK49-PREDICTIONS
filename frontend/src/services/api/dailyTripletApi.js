import { httpClient } from './httpClient';

export const dailyTripletApi = {
  async get() {
    const { data } = await httpClient.get('/daily-triplet');
    return data;
  },
};
