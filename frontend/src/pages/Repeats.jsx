import { useEffect, useState } from 'react';
import { repeatsApi } from '../services/api/repeatsApi';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { NumberBall } from '../components/ui/NumberBall';
import { Button } from '../components/ui/Button';

const TIER_TONE = { high: 'good', med: 'warn', low: 'default', new: 'default' };
const TIER_LABEL = { high: 'ÉLEVÉ', med: 'MOYEN', low: 'PEU DE DONNÉES', new: 'NOUVEAU' };
const PATTERN_LABEL = { A: 'Saute-milieu (✓ ✕ ✓)', B: 'Saute-fin (✓ ✓ ✕)' };

export function Repeats() {
  const [live, setLive] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    repeatsApi.getLive().then(setLive).catch(() => setLive({ predictions: [], history: {}, windowSize: 0 })).finally(() => setStatus('ready'));
    repeatsApi.getPerformance().then(setPerformance).catch(() => setPerformance([]));
  }, []);

  if (status === 'loading') return <p style={{ color: 'var(--t3)' }}>Chargement…</p>;

  const predictions = live?.predictions ?? [];
  const windowSize = live?.windowSize ?? 0;
  const histHits = performance.reduce((a, r) => a + r.hits.length, 0);
  const histTotal = performance.reduce((a, r) => a + r.total, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Repeats Tracker</h1>
        <Chip>{predictions.length} prédictions</Chip>
      </div>

      <Card style={{ marginBottom: 16, fontSize: 13, color: 'var(--t2)' }}>
        Prédit qu'un numéro reviendra au tirage suivant s'il a suivi l'un de ces schémas sur les {windowSize || 10} derniers tirages :
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <span><strong>A</strong> — {PATTERN_LABEL.A}</span>
          <span><strong>B</strong> — {PATTERN_LABEL.B}</span>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Performance</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Verrouillé par tirage, comparé au tirage suivant réel</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {performance.length > 0 && <Chip tone="good">{histHits}/{histTotal} hits</Chip>}
            <Button variant="ghost" onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? `${performance.length} lignes ▾` : `▸ Voir ${performance.length} lignes`}
            </Button>
          </div>
        </div>
        {showHistory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {performance.length === 0 && <p style={{ color: 'var(--t3)', fontSize: 12 }}>Pas assez d'historique pour évaluer la performance.</p>}
            {performance.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', borderRadius: 6, background: r.hits.length ? 'var(--gnl)' : 'var(--s2)' }}>
                <span style={{ fontSize: 11, width: 130, color: 'var(--t3)' }}>{r.drawDate?.slice(0, 10)} · {r.drawType === 'lunch' ? 'Lunch' : 'Tea'}</span>
                <span style={{ fontSize: 11, color: 'var(--t3)' }}>{r.total} prédictions</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                  {r.hits.map((h) => <NumberBall key={h.num} value={h.num} size={22} tone="v1" />)}
                  {r.hits.length === 0 && <span style={{ fontSize: 11, color: 'var(--t3)' }}>aucun hit</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {predictions.length === 0 && (
        <p style={{ color: 'var(--t3)' }}>Aucun schéma qualifiant sur la fenêtre actuelle.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {predictions.map((p) => (
          <Card key={p.num} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <NumberBall value={p.num} size={38} tone="v1" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Schéma {p.pattern} · {PATTERN_LABEL[p.pattern]}</div>
              <div style={{ marginTop: 4 }}>
                <Chip tone={TIER_TONE[p.tier]}>{TIER_LABEL[p.tier]}</Chip>
                {p.total > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--t3)' }}>{p.hits}/{p.total} historique</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
