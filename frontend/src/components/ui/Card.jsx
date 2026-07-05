export function Card({ children, style }) {
  return (
    <div
      style={{
        background: 'var(--s)',
        border: '1px solid var(--b)',
        borderRadius: 12,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
