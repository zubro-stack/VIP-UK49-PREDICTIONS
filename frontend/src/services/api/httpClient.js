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
    // The refresh call itself failing (expired/invalid refresh cookie) must
    // fall straight through to clearSession() - letting it re-enter this
    // same 401 branch (it goes through this interceptor too) creates a
    // promise that awaits its own resolution instead of ever rejecting.
    const isRefreshCall = config?.url === '/auth/refresh';
    if (response?.status === 401 && isRefreshCall) {
      useAuthStore.getState().clearSession();
      return Promise.reject(error.response?.data?.error ?? error);
    }
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
