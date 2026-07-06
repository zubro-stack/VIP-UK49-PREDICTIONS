import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Draws } from '../pages/Draws';
import { EngineGroupPage } from '../pages/engines/EngineGroupPage';
import { Repeats } from '../pages/Repeats';
import { V3 } from '../pages/V3';
import { Backtesting } from '../pages/Backtesting';
import { BestPairs } from '../pages/BestPairs';
import { Calc } from '../pages/Calc';
import { Posts } from '../pages/Posts';
import { FAQ } from '../pages/FAQ';
import { AdminUsers } from '../pages/admin/Users';
import { ENGINE_PAGES } from './engineNav';

const engineRoutes = ENGINE_PAGES.map((e) => ({
  path: `engines/${e.path}`,
  element: <EngineGroupPage label={e.label} tabs={e.tabs} />,
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
      { path: 'best-pairs', element: <BestPairs /> },
      { path: 'calc', element: <Calc /> },
      {
        path: 'backtesting',
        element: (
          <ProtectedRoute minRole="manager">
            <Backtesting />
          </ProtectedRoute>
        ),
      },
      { path: 'posts', element: <Posts /> },
      { path: 'faq', element: <FAQ /> },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute minRole="admin">
            <AdminUsers />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
