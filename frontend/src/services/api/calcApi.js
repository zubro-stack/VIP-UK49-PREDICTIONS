import { httpClient } from './httpClient';

export const calcApi = {
  /** One combined fetch for both the live result and the tracker - avoids two separate full draws-table round trips. */
  async getPage({ lunchDrawId, teaDrawId } = {}) {
    const { data } = await httpClient.get('/calc', { params: { lunchDrawId, teaDrawId } });
    return data;
  },
};
