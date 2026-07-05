import { useAuthStore } from '../store/authStore';

export function useRole(minRole) {
  return useAuthStore((s) => (s.user ? s.hasRole(minRole) : false));
}
