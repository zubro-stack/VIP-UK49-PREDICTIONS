export function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
      {label && <span style={{ fontSize: 11, color: 'var(--t3)', letterSpacing: 0.4 }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: 'var(--b)' }} />
    </div>
  );
}
