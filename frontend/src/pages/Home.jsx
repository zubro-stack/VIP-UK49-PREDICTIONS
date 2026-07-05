import { useAuth } from '../hooks/useAuth';
import { PAIRWISE_ENGINE_NAV } from '../app/engineNav';
import { Card } from '../components/ui/Card';

export function Home() {
  const { user } = useAuth();
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Bonjour {user?.displayName}</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 24 }}>
        Choisissez un moteur d'analyse dans le menu pour consulter ses prédictions actives.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {PAIRWISE_ENGINE_NAV.map((e) => (
          <Card key={e.code}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{e.label}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Moteur générique paramétré</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
