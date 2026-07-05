import { NumberBall } from '../ui/NumberBall';

export function PredictionBadges({ addPreds, subPreds }) {
  if (addPreds.length === 0 && subPreds.length === 0) {
    return <span style={{ color: 'var(--t3)', fontSize: 12 }}>Aucune prédiction valide</span>;
  }
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {addPreds.map((n) => (
        <NumberBall key={`add-${n}`} value={n} size={28} tone="v1" />
      ))}
      {subPreds.map((n) => (
        <NumberBall key={`sub-${n}`} value={n} size={28} tone="v3" />
      ))}
    </div>
  );
}
