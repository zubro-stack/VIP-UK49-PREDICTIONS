export function StatTile({ value, label, tone }) {
  return (
    <div
      style={{
        background: tone ?? 'var(--s2)',
        borderRadius: 8,
        padding: '10px 14px',
        textAlign: 'center',
        minWidth: 64,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
