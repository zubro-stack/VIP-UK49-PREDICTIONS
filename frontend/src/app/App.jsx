import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api/authApi';

export function App() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    const { accessToken, user, hydrateUser, clearSession } = useAuthStore.getState();
    if (accessToken && !user) {
      authApi.me().then(hydrateUser).catch(clearSession);
    }
  }, []);

  // A stored token is being resolved into a user (see authStore) - render
  // nothing rather than let ProtectedRoute redirect on a momentarily-null
  // user and bounce an authenticated visitor back to /login.
  if (status === 'loading') return null;

  return <RouterProvider router={router} />;
}
