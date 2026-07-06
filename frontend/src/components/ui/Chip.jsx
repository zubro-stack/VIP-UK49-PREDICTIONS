export function Chip({ children, tone = 'default' }) {
  const palette = {
    default: { bg: 'var(--s2)', fg: 'var(--t2)' },
    good: { bg: 'var(--gnl)', fg: 'var(--gnd)' },
    bad: { bg: 'var(--rdl)', fg: 'var(--rd)' },
    warn: { bg: 'var(--aml)', fg: 'var(--am)' },
  };
  const { bg, fg } = palette[tone] ?? palette.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 'var(--r-pill)',
        background: bg,
        color: fg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        lineHeight: 1.4,
      }}
    >
      {children}
    </span>
  );
}
