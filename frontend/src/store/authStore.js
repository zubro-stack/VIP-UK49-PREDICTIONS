import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'uk49s-access-token';

const initialToken = sessionStorage.getItem(ACCESS_TOKEN_KEY) || null;

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: initialToken,
  // A stored token with no `user` yet means a page refresh happened - stay
  // in 'loading' until the app bootstraps the user via /auth/me, so
  // ProtectedRoute doesn't treat "no user yet" as "no permissions".
  status: initialToken ? 'loading' : 'ready', // loading | ready

  setSession({ user, accessToken }) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    set({ user, accessToken, status: 'ready' });
  },

  clearSession() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    set({ user: null, accessToken: null, status: 'ready' });
  },

  hydrateUser(user) {
    set({ user, status: 'ready' });
  },

  hasRole(minRole) {
    const rank = { user: 1, manager: 2, admin: 3 };
    const role = get().user?.role;
    return role ? rank[role] >= rank[minRole] : false;
  },
}));
