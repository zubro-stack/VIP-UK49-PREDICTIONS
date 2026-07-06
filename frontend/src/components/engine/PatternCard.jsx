import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { NumberBall } from '../ui/NumberBall';
import { StreakBadge } from './StreakBadge';
import { HitHistoryStrip } from './HitHistoryStrip';
import { PredictionBadges } from './PredictionBadges';
import { Button } from '../ui/Button';

const POSITION_LABELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'B'];

export function PatternCard({ card, canManage, onMiss, onDelete }) {
  return (
    <Card interactive>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {card.drawType && <Chip>{card.drawType === 'lunch' ? 'Lunch' : 'Tea'}</Chip>}
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>
            {POSITION_LABELS[card.positionA]} ↔ {POSITION_LABELS[card.positionB]}
          </span>
          {card.hasDirectHit && <Chip tone="good">Hit direct</Chip>}
        </div>
        <StreakBadge streak={card.streak} />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <NumberBall value={card.v1} />
        <span style={{ color: 'var(--t3)' }}>+/−</span>
        <NumberBall value={card.v2} />
        <span style={{ color: 'var(--t3)', fontSize: 12 }}>({card.sourceDate})</span>
      </div>

      <PredictionBadges addPreds={card.addPreds} subPreds={card.subPreds} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <HitHistoryStrip last5={card.last5} />
        <span style={{ fontSize: 11, color: 'var(--t3)' }}>{card.totalHits} hits au total</span>
      </div>

      {canManage && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Button variant="ghost" onClick={() => onMiss(card.id)}>
            Marquer un miss
          </Button>
          <Button variant="danger" onClick={() => onDelete(card.id)}>
            Supprimer
          </Button>
        </div>
      )}
    </Card>
  );
}
