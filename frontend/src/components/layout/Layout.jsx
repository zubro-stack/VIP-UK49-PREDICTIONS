import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { Toast } from '../ui/Toast';
import { ENGINE_PAGES } from '../../app/engineNav';

const linkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 13,
  color: isActive ? 'var(--v1)' : 'var(--t2)',
  background: isActive ? 'var(--s2)' : 'transparent',
  textDecoration: 'none',
});

function NavSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--t3)', padding: '0 12px 6px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const isManager = useRole('manager');
  const isAdmin = useRole('admin');

  return (
    <div className="app-shell">
      <aside style={{ background: 'var(--s)', borderRight: '1px solid var(--b)', padding: '20px 10px' }}>
        <div style={{ padding: '0 12px 20px', fontWeight: 800, fontSize: 15 }}>UK49s Predictions</div>

        <NavSection title="Vue d'ensemble">
          <NavLink to="/" end style={linkStyle}>Accueil</NavLink>
          {isManager && <NavLink to="/draws" style={linkStyle}>Tirages</NavLink>}
        </NavSection>

        <NavSection title="Moteurs">
          {ENGINE_PAGES.map((e) => (
            <NavLink key={e.path} to={`/engines/${e.path}`} style={linkStyle}>{e.label}</NavLink>
          ))}
          <NavLink to="/engines/v3" style={linkStyle}>V3 Zubro Tracker</NavLink>
          <NavLink to="/repeats" style={linkStyle}>Repeats Tracker</NavLink>
        </NavSection>

        <NavSection title="Outils">
          <NavLink to="/best-pairs" style={linkStyle}>Best Pairs</NavLink>
          <NavLink to="/calc" style={linkStyle}>Prediction Calc</NavLink>
          {isManager && <NavLink to="/backtesting" style={linkStyle}>Backtesting</NavLink>}
          <NavLink to="/posts" style={linkStyle}>Publications</NavLink>
          <NavLink to="/faq" style={linkStyle}>FAQ</NavLink>
        </NavSection>

        {isAdmin && (
          <NavSection title="Administration">
            <NavLink to="/admin/users" style={linkStyle}>Utilisateurs</NavLink>
          </NavSection>
        )}
      </aside>

      <div>
        <header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 12,
            padding: '14px 24px',
            borderBottom: '1px solid var(--b)',
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--t2)' }}>
            {user?.displayName} · {user?.role}
          </span>
          <button
            onClick={logout}
            style={{ background: 'none', border: '1px solid var(--b)', borderRadius: 6, padding: '4px 10px', color: 'var(--t2)', fontSize: 12 }}
          >
            Déconnexion
          </button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
