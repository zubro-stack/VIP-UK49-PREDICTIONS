import { useState } from 'react';
import { bestPairsApi } from '../services/api/bestPairsApi';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { NumberBall } from '../components/ui/NumberBall';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';

const MAX_SELECTED = 14;
const SIZE_OPTIONS = [
  { size: 2, label: 'Paires' },
  { size: 3, label: 'Triplets' },
  { size: 4, label: 'Quadruplets' },
];
const ALL_NUMBERS = Array.from({ length: 49 }, (_, i) => i + 1);

export function BestPairs() {
  const [selected, setSelected] = useState([]);
  const [size, setSize] = useState(2);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  function toggleNumber(n) {
    setResult(null);
    setSelected((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= MAX_SELECTED) {
        showToast(`Maximum ${MAX_SELECTED} numéros`, true);
        return prev;
      }
      return [...prev, n];
    });
  }

  async function analyze() {
    if (selected.length < size) {
      showToast(`Sélectionnez au moins ${size} numéros`, true);
      return;
    }
    setBusy(true);
    try {
      const data = await bestPairsApi.analyze(selected, size);
      setResult(data);
      showToast(`${data.combos.length} combinaisons trouvées`);
    } catch (err) {
      showToast(err.message || 'Échec de l\'analyse', true);
    } finally {
      setBusy(false);
    }
  }

  function clearAll() {
    setSelected([]);
    setResult(null);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Combinaisons</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 16 }}>
        Sélectionnez vos numéros pour trouver les combinaisons qui apparaissent ensemble sur les lignes de la charte Zubro.
      </p>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {ALL_NUMBERS.map((n) => (
            <button
              key={n}
              onClick={() => toggleNumber(n)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid var(--b)',
                background: selected.includes(n) ? 'var(--v1)' : 'var(--s2)',
                color: selected.includes(n) ? '#0f1115' : 'var(--t2)',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {SIZE_OPTIONS.map((opt) => (
            <label key={opt.size} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <input type="radio" name="size" checked={size === opt.size} onChange={() => { setSize(opt.size); setResult(null); }} />
              {opt.label}
            </label>
          ))}
          <Button onClick={analyze} disabled={busy}>{busy ? 'Analyse…' : 'Analyser'}</Button>
          <Button variant="ghost" onClick={clearAll}>Effacer</Button>
          <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 'auto' }}>{selected.length}/{MAX_SELECTED} sélectionnés</span>
        </div>
      </Card>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {result.combos.map((c, i) => (
            <Card key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {c.combo.map((n) => <NumberBall key={n} value={n} size={28} tone="v1" />)}
              <Chip>{c.lines.length} ligne(s)</Chip>
            </Card>
          ))}
          {result.combos.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucune combinaison trouvée pour cette sélection.</p>}
        </div>
      )}
    </div>
  );
}
