import { httpClient } from './httpClient';

export const authApi = {
  async login(email, password) {
    const { data } = await httpClient.post('/auth/login', { email, password });
    return data;
  },
  async me() {
    const { data } = await httpClient.get('/auth/me');
    return data;
  },
  async logout() {
    await httpClient.post('/auth/logout');
  },
};
