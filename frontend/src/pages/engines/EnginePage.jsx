import { useEngine } from '../../hooks/useEngine';
import { useRole } from '../../hooks/useRole';
import { useUiStore } from '../../store/uiStore';
import { PatternCard } from '../../components/engine/PatternCard';
import { Button } from '../../components/ui/Button';

/**
 * One page component drives all 7 pairwise-engine routes (V1 Sequential,
 * V1 Family, V2, Same Day, Bonus Sequential/Family/V2) — only the engine
 * code and label change, mirroring the backend's single generic engine.
 */
export function EnginePage({ code, label }) {
  const { cards, status, run, recordMiss, deletePattern } = useEngine(code);
  const canManage = useRole('manager');
  const showToast = useUiStore((s) => s.showToast);

  async function handleRun() {
    try {
      await run();
      showToast(`${label} recalculé — ${cards.length} prédictions actives`);
    } catch (err) {
      showToast(err.message || 'Échec du calcul', true);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>{label}</h1>
        {canManage && <Button onClick={handleRun}>Recalculer</Button>}
      </div>

      {status === 'loading' && <p style={{ color: 'var(--t3)' }}>Chargement…</p>}
      {status === 'error' && <p style={{ color: 'var(--rd)' }}>Erreur de chargement des prédictions.</p>}

      {status === 'ready' && cards.length === 0 && (
        <p style={{ color: 'var(--t3)' }}>Aucune prédiction active. Lancez un recalcul si de nouveaux tirages ont été ajoutés.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {cards.map((card) => (
          <PatternCard
            key={card.id}
            card={card}
            canManage={canManage}
            onMiss={recordMiss}
            onDelete={deletePattern}
          />
        ))}
      </div>
    </div>
  );
}
