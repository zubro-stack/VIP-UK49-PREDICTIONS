import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'uk49s-access-token';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: sessionStorage.getItem(ACCESS_TOKEN_KEY) || null,
  status: 'idle', // idle | loading | ready

  setSession({ user, accessToken }) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    set({ user, accessToken, status: 'ready' });
  },

  clearSession() {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    set({ user: null, accessToken: null, status: 'ready' });
  },

  hasRole(minRole) {
    const rank = { user: 1, manager: 2, admin: 3 };
    const role = get().user?.role;
    return role ? rank[role] >= rank[minRole] : false;
  },
}));
