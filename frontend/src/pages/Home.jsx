import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEnginesStore } from '../store/enginesStore';
import { dailyTripletApi } from '../services/api/dailyTripletApi';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { NumberBall } from '../components/ui/NumberBall';

function DailyTripletCard() {
  const [triplet, setTriplet] = useState(null);

  useEffect(() => {
    dailyTripletApi.get().then(setTriplet).catch(() => setTriplet(null));
  }, []);

  if (!triplet) return null;

  return (
    <Card style={{ marginBottom: 'var(--sp-6)', borderTop: '3px solid var(--v3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Votre triplet du jour</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{triplet.date}</div>
        </div>
        {triplet.sharingCount > 1 && <Chip tone="warn">{triplet.sharingCount} comptes partagent ce triplet</Chip>}
      </div>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '8px 0 4px' }}>
        {triplet.triplet.map((n) => (
          <NumberBall key={n} value={n} size={56} tone="v3" />
        ))}
      </div>
    </Card>
  );
}

const BONUS_SUB_CODES = ['bonus-seq', 'bonus-fam', 'bonus-v2'];

/**
 * Bonus Sequential/Family/V2 are three independently stored sub-engines,
 * but the user only ever opens one "Bonus Tracker" page and runs one
 * analysis - so the catalog's three bonus codes are collapsed into a
 * single tile here, in the position the first one occupied.
 */
function collapseBonusTiles(catalog) {
  const tiles = [];
  let inserted = false;
  catalog.forEach((e) => {
    if (BONUS_SUB_CODES.includes(e.code)) {
      if (!inserted) {
        tiles.push({ code: 'bonus-tracker', label: 'Bonus Tracker', category: 'pairwise', implemented: true });
        inserted = true;
      }
      return;
    }
    tiles.push(e);
  });
  return tiles;
}

export function Home() {
  const { user } = useAuth();
  const catalog = useEnginesStore((s) => s.catalog);
  const loadCatalog = useEnginesStore((s) => s.loadCatalog);
  const tiles = collapseBonusTiles(catalog);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.3, marginBottom: 6 }}>Bonjour {user?.displayName}</h1>
      <p style={{ color: 'var(--t2)', marginBottom: 'var(--sp-6)' }}>
        Choisissez un moteur d'analyse dans le menu pour consulter ses prédictions actives.
      </p>

      <DailyTripletCard />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
        {tiles.map((e) => (
          <Card key={e.code} interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.label}</div>
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
