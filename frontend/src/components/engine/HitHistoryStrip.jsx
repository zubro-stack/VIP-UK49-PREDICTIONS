export function HitHistoryStrip({ last5 }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {last5.map((entry, i) => (
        <span
          key={i}
          title={entry.sourceDate}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: entry.hit ? 'var(--gnd)' : 'var(--rd)',
          }}
        />
      ))}
    </div>
  );
}
