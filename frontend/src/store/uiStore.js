import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  toast: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  showToast(message, isError = false) {
    set({ toast: { message, isError } });
    setTimeout(() => set((s) => (s.toast?.message === message ? { toast: null } : s)), 3000);
  },
}));
