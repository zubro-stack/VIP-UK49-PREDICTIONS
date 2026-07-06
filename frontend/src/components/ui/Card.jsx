export function Card({ children, style, interactive = false, className = '' }) {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
