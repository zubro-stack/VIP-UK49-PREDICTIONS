import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEnginesStore } from '../store/enginesStore';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';

export function Home() {
  const { user } = useAuth();
  const catalog = useEnginesStore((s) => s.catalog);
  const loadCatalog = useEnginesStore((s) => s.loadCatalog);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Bonjour {user?.displayName}</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 24 }}>
        Choisissez un moteur d'analyse dans le menu pour consulter ses prédictions actives.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {catalog.map((e) => (
          <Card key={e.code}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontWeight: 700 }}>{e.label}</div>
              {!e.implemented && <Chip tone="warn">Bientôt</Chip>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              {e.category === 'pairwise' ? 'Moteur générique paramétré' : e.category === 'triplet' ? 'Moteur de sets verrouillés' : 'Outil'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
