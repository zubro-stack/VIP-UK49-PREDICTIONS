import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api/authApi';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function login(email, password) {
    const { user: loggedInUser, accessToken: token } = await authApi.login(email, password);
    setSession({ user: loggedInUser, accessToken: token });
  }

  async function logout() {
    await authApi.logout().catch(() => {});
    clearSession();
  }

  return { user, accessToken, isAuthenticated: Boolean(accessToken), login, logout };
}
