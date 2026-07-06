export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button {...props} className={`btn btn-${variant} ${className}`.trim()}>
      {children}
    </button>
  );
}
