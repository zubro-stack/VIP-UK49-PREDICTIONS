import { useEffect, useState } from 'react';
import { backtestsApi } from '../services/api/backtestsApi';
import { BACKTESTABLE_ENGINE_LABELS } from '../app/engineNav';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';

const STATUS_TONE = { done: 'good', running: 'warn', queued: 'default', failed: 'bad' };
const STATUS_LABEL = { done: 'Terminé', running: 'En cours', queued: 'En file', failed: 'Échec' };

function formatPct(rate) {
  return rate == null ? '—' : `${Math.round(rate * 100)}%`;
}

export function Backtesting() {
  const [runs, setRuns] = useState([]);
  const [selectedEngine, setSelectedEngine] = useState('v1-seq');
  const [running, setRunning] = useState(false);
  const [expandedRun, setExpandedRun] = useState(null);
  const showToast = useUiStore((s) => s.showToast);

  async function loadRuns() {
    setRuns(await backtestsApi.list());
  }

  useEffect(() => {
    loadRuns();
  }, []);

  async function handleRun() {
    setRunning(true);
    try {
      await backtestsApi.create(selectedEngine);
      await loadRuns();
      showToast(`Backtest ${BACKTESTABLE_ENGINE_LABELS[selectedEngine]} terminé`);
    } catch (err) {
      showToast(err.message || 'Échec du backtest', true);
    } finally {
      setRunning(false);
    }
  }

  async function toggleDetail(id) {
    if (expandedRun?.id === id) {
      setExpandedRun(null);
      return;
    }
    const detail = await backtestsApi.getById(id);
    setExpandedRun(detail);
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Backtesting</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 16 }}>
        Rejoue un moteur sur l'historique des tirages, checkpoint par checkpoint, et mesure son taux de réussite réel.
      </p>

      <Card style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <select
          value={selectedEngine}
          onChange={(e) => setSelectedEngine(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid var(--b)', background: 'var(--s2)', color: 'var(--t)' }}
        >
          {Object.entries(BACKTESTABLE_ENGINE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <Button onClick={handleRun} disabled={running}>{running ? 'Backtest en cours…' : 'Lancer un backtest'}</Button>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {runs.map((run) => {
          const label = BACKTESTABLE_ENGINE_LABELS[run.engineCode] ?? run.engineCode;
          const metrics = expandedRun?.id === run.id ? expandedRun.results : null;
          const hitRate = metrics?.find((m) => m.metricName === 'overallHitRate')?.metricValue;
          const totalPredictions = metrics?.find((m) => m.metricName === 'totalPredictions')?.metricValue;
          const totalHits = metrics?.find((m) => m.metricName === 'totalHits')?.metricValue;
          return (
            <Card key={run.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <strong>{label}</strong>
                  <Chip tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Chip>
                  <span style={{ fontSize: 11, color: 'var(--t3)' }}>{new Date(run.createdAt).toLocaleString('fr-FR')}</span>
                </div>
                <Button variant="ghost" onClick={() => toggleDetail(run.id)}>
                  {expandedRun?.id === run.id ? 'Masquer' : 'Détails'}
                </Button>
              </div>
              {expandedRun?.id === run.id && metrics && (
                <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 13 }}>
                  <span>Taux de réussite : <strong>{formatPct(hitRate)}</strong></span>
                  <span>{totalHits} / {totalPredictions} prédictions correctes</span>
                </div>
              )}
            </Card>
          );
        })}
        {runs.length === 0 && <p style={{ color: 'var(--t3)' }}>Aucun backtest lancé pour le moment.</p>}
      </div>
    </div>
  );
}
