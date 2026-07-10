import { useEffect, useState } from 'react';
import { bonusTrackerApi } from '../services/api/bonusTrackerApi';
import { enginesApi } from '../services/api/enginesApi';
import { useRole } from '../hooks/useRole';
import { useUiStore } from '../store/uiStore';
import { Card } from '../components/ui/Card';
import { StatTile } from '../components/ui/StatTile';
import { NumberBall } from '../components/ui/NumberBall';
import { Button } from '../components/ui/Button';
import { PatternCard } from '../components/engine/PatternCard';

/**
 * One page, one "Run Analysis" action, one merged prediction feed - the
 * Bonus Tracker is three independent sub-engines (Sequential/Family/V2)
 * under the hood, but the user opens a single tracker and runs a single
 * analysis, so the UI never splits it into separate tabs/pages.
 */
export function BonusTracker() {
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState('loading');
  const canManage = useRole('manager');
  const showToast = useUiStore((s) => s.showToast);

  function load() {
    setStatus('loading');
    bonusTrackerApi
      .getPage()
      .then((data) => {
        setPage(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }

  useEffect(load, []);

  async function handleRun() {
    try {
      const data = await bonusTrackerApi.run();
      setPage(data);
      showToast(`Bonus Tracker recalculé — ${data.activeCount} prédictions actives`);
    } catch (err) {
      showToast(err.message || 'Échec du calcul', true);
    }
  }

  async function handleMiss(engineCode, id) {
    await enginesApi.recordMiss(engineCode, id);
    load();
  }

  async function handleDelete(engineCode, id) {
    await enginesApi.deletePattern(engineCode, id);
    load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Bonus Tracker</h1>
          <p style={{ color: 'var(--t2)', fontSize: 13 }}>Sequential + Family + V2 · cible la boule bonus uniquement</p>
        </div>
        {canManage && <Button onClick={handleRun}>Run Analysis</Button>}
      </div>

      {status === 'loading' && <p style={{ color: 'var(--t3)' }}>Chargement…</p>}
      {status === 'error' && <p style={{ color: 'var(--rd)' }}>Erreur de chargement des prédictions.</p>}

      {page && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatTile value={page.activeCount} label="Prédictions actives" />
            <StatTile value={page.predictedNumbers.length} label="Numéros prédits" />
          </div>

          {page.predictedNumbers.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13 }}>Tous les bonus prédits</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {page.predictedNumbers.map((n) => (
                  <NumberBall key={n} value={n} size={28} tone="v3" />
                ))}
              </div>
            </Card>
          )}

          {page.cards.length === 0 && (
            <p style={{ color: 'var(--t3)' }}>Aucune prédiction active. Lancez un recalcul si de nouveaux tirages ont été ajoutés.</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {page.cards.map((card) => (
              <PatternCard
                key={`${card.engineCode}-${card.id}`}
                card={card}
                canManage={canManage}
                onMiss={(id) => handleMiss(card.engineCode, id)}
                onDelete={(id) => handleDelete(card.engineCode, id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
