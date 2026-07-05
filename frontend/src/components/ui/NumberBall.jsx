export function NumberBall({ value, size = 32, tone = 'default' }) {
  const palette = {
    default: { bg: 'var(--s2)', fg: 'var(--t2)' },
    v1: { bg: 'var(--v1l)', fg: 'var(--v1)' },
    v2: { bg: 'var(--v2l)', fg: 'var(--v2)' },
    v3: { bg: 'var(--v3l)', fg: 'var(--v3)' },
  };
  const { bg, fg } = palette[tone] ?? palette.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color: fg,
        fontWeight: 700,
        fontSize: size <= 24 ? 10 : 12,
        border: '1px solid var(--b)',
      }}
    >
      {value}
    </span>
  );
}
