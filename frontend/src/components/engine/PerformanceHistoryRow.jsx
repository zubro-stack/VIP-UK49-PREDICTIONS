import { NumberBall } from '../ui/NumberBall';

/**
 * One row of a checkpoint-replay performance history: date/type label,
 * a total-predictions summary, and the hit numbers (or "aucun hit").
 * Shared by Repeats and V3's Hot Numbers tab instead of four near-
 * identical inline blocks across two files.
 */
export function PerformanceHistoryRow({ date, type, totalLabel, hits, getHitValue = (h) => h, ballTone = 'v1' }) {
  const hasHits = hits.length > 0;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 6,
        background: hasHits ? 'var(--gnl)' : 'var(--s2)',
      }}
    >
      <span style={{ fontSize: 11, width: 130, color: 'var(--t3)' }}>
        {date?.slice(0, 10)} · {type === 'lunch' ? 'Lunch' : 'Tea'}
      </span>
      <span style={{ fontSize: 11, color: 'var(--t3)' }}>{totalLabel}</span>
      <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
        {hits.map((h, i) => (
          <NumberBall key={i} value={getHitValue(h)} size={20} tone={ballTone} />
        ))}
        {!hasHits && <span style={{ fontSize: 11, color: 'var(--t3)' }}>aucun hit</span>}
      </span>
    </div>
  );
}
