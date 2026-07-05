export function Button({ children, variant = 'primary', ...props }) {
  const variants = {
    primary: { background: 'var(--v1)', color: '#0f1115', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--t2)', border: '1px solid var(--b)' },
    danger: { background: 'var(--rdl)', color: 'var(--rd)', border: 'none' },
  };
  return (
    <button
      {...props}
      style={{
        ...variants[variant],
        padding: '8px 16px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 13,
        opacity: props.disabled ? 0.6 : 1,
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}
