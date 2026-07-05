import { useEffect } from 'react';
import { useEnginesStore } from '../store/enginesStore';

export function useEngine(code) {
  const entry = useEnginesStore((s) => s.byCode[code]);
  const loadCards = useEnginesStore((s) => s.loadCards);
  const runEngine = useEnginesStore((s) => s.runEngine);
  const recordMiss = useEnginesStore((s) => s.recordMiss);
  const deletePattern = useEnginesStore((s) => s.deletePattern);

  useEffect(() => {
    loadCards(code);
  }, [code, loadCards]);

  return {
    cards: entry?.cards ?? [],
    status: entry?.status ?? 'idle',
    error: entry?.error,
    run: () => runEngine(code),
    recordMiss: (id) => recordMiss(code, id),
    deletePattern: (id) => deletePattern(code, id),
  };
}
