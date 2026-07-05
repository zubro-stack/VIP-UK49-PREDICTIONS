import { useUiStore } from '../../store/uiStore';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        padding: '10px 16px',
        borderRadius: 8,
        background: toast.isError ? 'var(--rdl)' : 'var(--gnl)',
        color: toast.isError ? 'var(--rd)' : 'var(--gnd)',
        border: `1px solid ${toast.isError ? '#F5A5A5' : '#6EE7B7'}`,
        fontSize: 13,
        zIndex: 1000,
      }}
    >
      {toast.message}
    </div>
  );
}
