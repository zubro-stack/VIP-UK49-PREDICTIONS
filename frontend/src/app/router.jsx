import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Draws } from '../pages/Draws';
import { EnginePage } from '../pages/engines/EnginePage';
import { Repeats } from '../pages/Repeats';
import { V3 } from '../pages/V3';
import { ComingSoon } from '../pages/ComingSoon';
import { PAIRWISE_ENGINE_NAV } from './engineNav';

const engineRoutes = PAIRWISE_ENGINE_NAV.map((e) => ({
  path: `engines/${e.path}`,
  element: <EnginePage code={e.code} label={e.label} />,
}));

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <ProtectedRoute minRole="user">
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      {
        path: 'draws',
        element: (
          <ProtectedRoute minRole="manager">
            <Draws />
          </ProtectedRoute>
        ),
      },
      ...engineRoutes,
      { path: 'engines/v3', element: <V3 /> },
      { path: 'repeats', element: <Repeats /> },
      { path: 'best-pairs', element: <ComingSoon title="Combinaisons" /> },
      {
        path: 'backtesting',
        element: (
          <ProtectedRoute minRole="manager">
            <ComingSoon title="Backtesting" />
          </ProtectedRoute>
        ),
      },
      { path: 'posts', element: <ComingSoon title="Publications" /> },
      { path: 'faq', element: <ComingSoon title="FAQ" /> },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute minRole="admin">
            <ComingSoon title="Utilisateurs" />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
