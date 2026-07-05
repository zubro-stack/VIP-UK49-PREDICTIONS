import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ minRole = 'user', children }) {
  const isAuthenticated = useAuthStore((s) => Boolean(s.accessToken));
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(minRole)) return <Navigate to="/" replace />;
  return children;
}
