import { create } from 'zustand';
import { enginesApi } from '../services/api/enginesApi';

/**
 * One generic slice keyed by engine code, instead of a separate store per
 * engine — the 7 pairwise engines (and future ones) all share the same
 * fetch/run/cache shape.
 */
export const useEnginesStore = create((set, get) => ({
  catalog: [],
  byCode: {}, // { [code]: { cards, status: 'idle'|'loading'|'error', error } }

  async loadCatalog() {
    const catalog = await enginesApi.getCatalog();
    set({ catalog });
  },

  async loadCards(code) {
    set((s) => ({ byCode: { ...s.byCode, [code]: { ...s.byCode[code], status: 'loading' } } }));
    try {
      const cards = await enginesApi.getPatterns(code);
      set((s) => ({ byCode: { ...s.byCode, [code]: { cards, status: 'ready' } } }));
      return cards;
    } catch (err) {
      set((s) => ({ byCode: { ...s.byCode, [code]: { cards: [], status: 'error', error: err.message } } }));
      return [];
    }
  },

  async runEngine(code) {
    await enginesApi.run(code);
    return get().loadCards(code);
  },

  async recordMiss(code, patternId) {
    await enginesApi.recordMiss(code, patternId);
    await get().loadCards(code);
  },

  async deletePattern(code, patternId) {
    await enginesApi.deletePattern(code, patternId);
    await get().loadCards(code);
  },
}));
