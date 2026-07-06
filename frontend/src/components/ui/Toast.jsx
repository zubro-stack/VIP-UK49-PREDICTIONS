import { useUiStore } from '../../store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        padding: '12px 18px',
        borderRadius: 'var(--r-sm)',
        background: toast.isError ? 'var(--rdl)' : 'var(--gnl)',
        color: toast.isError ? 'var(--rd)' : 'var(--gnd)',
        border: `1px solid ${toast.isError ? '#F5A5A5' : '#6EE7B7'}`,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: 'var(--shadow-md)',
        zIndex: 1000,
        animation: 'toast-in 0.18s ease-out',
      }}
    >
      {toast.message}
    </div>
  );
}
