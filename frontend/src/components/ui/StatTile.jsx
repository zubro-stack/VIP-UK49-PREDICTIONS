export function StatTile({ value, label, tone }) {
  return (
    <div
      style={{
        background: tone ?? 'var(--s2)',
        border: '1px solid var(--b)',
        borderRadius: 'var(--r-sm)',
        padding: '10px 16px',
        textAlign: 'center',
        minWidth: 68,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--t3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
