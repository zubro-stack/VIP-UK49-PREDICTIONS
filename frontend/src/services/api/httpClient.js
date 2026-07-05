import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const httpClient = axios.create({ baseURL: '/api', withCredentials: true });

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retried) {
      config._retried = true;
      try {
        refreshPromise ??= httpClient.post('/auth/refresh').finally(() => {
          refreshPromise = null;
        });
        const { data } = await refreshPromise;
        useAuthStore.setState({ accessToken: data.accessToken });
        sessionStorage.setItem('uk49s-access-token', data.accessToken);
        return httpClient(config);
      } catch {
        useAuthStore.getState().clearSession();
      }
    }
    return Promise.reject(error.response?.data?.error ?? error);
  }
);

export { httpClient };
