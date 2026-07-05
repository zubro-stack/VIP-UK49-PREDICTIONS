import { create } from 'zustand';
import { drawsApi } from '../services/api/drawsApi';

export const useDrawsStore = create((set) => ({
  draws: [],
  status: 'idle',

  async load(filters) {
    set({ status: 'loading' });
    const draws = await drawsApi.list(filters);
    set({ draws, status: 'ready' });
  },

  async add(draw) {
    const created = await drawsApi.create(draw);
    set((s) => ({ draws: [...s.draws, created] }));
    return created;
  },
}));
