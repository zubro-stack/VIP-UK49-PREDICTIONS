import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useUiStore } from '../../store/uiStore';
import { Toast } from '../ui/Toast';
import { ENGINE_PAGES } from '../../app/engineNav';

function NavItem({ to, end, icon, children }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <span className="nav-icon">{icon}</span>
      {children}
    </NavLink>
  );
}

function NavSection({ title, children }) {
  return (
    <div style={{ marginBottom: 'var(--sp-5)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--t3)', padding: '0 12px 8px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
    </div>
  );
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Layout() {
  const { user, logout } = useAuth();
  const isManager = useRole('manager');
  const isAdmin = useRole('admin');
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  return (
    <div className="app-shell">
      <div className={`sidebar-backdrop${sidebarOpen ? ' visible' : ''}`} onClick={closeSidebar} />
      <aside
        className={`sidebar${sidebarOpen ? ' open' : ''}`}
        style={{
          background: 'var(--s)',
          borderRight: '1px solid var(--b)',
          padding: 'var(--sp-5) var(--sp-3)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 'var(--sp-6)' }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 'var(--r-sm)',
              background: 'var(--v1l)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            🎱
          </span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.2 }}>UK49s Predictions</span>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }} onClick={(e) => e.target.closest('a') && closeSidebar()}>
          <NavSection title="Vue d'ensemble">
            <NavItem to="/" end icon="🏠">Accueil</NavItem>
            {isManager && <NavItem to="/draws" icon="📊">Tirages</NavItem>}
          </NavSection>

          <NavSection title="Moteurs">
            {ENGINE_PAGES.map((e) => (
              <NavItem key={e.path} to={`/engines/${e.path}`} icon={e.icon}>{e.label}</NavItem>
            ))}
            <NavItem to="/engines/bonus-tracker" icon="🎱">Bonus Tracker</NavItem>
            <NavItem to="/engines/v3" icon="🔥">V3 Zubro Tracker</NavItem>
            <NavItem to="/repeats" icon="🔁">Repeats Tracker</NavItem>
          </NavSection>

          <NavSection title="Outils">
            <NavItem to="/best-pairs" icon="🎯">Best Pairs</NavItem>
            <NavItem to="/calc" icon="🧮">Prediction Calc</NavItem>
            {isManager && <NavItem to="/backtesting" icon="📈">Backtesting</NavItem>}
            <NavItem to="/posts" icon="💬">Publications</NavItem>
            <NavItem to="/faq" icon="📖">FAQ</NavItem>
          </NavSection>

          {isAdmin && (
            <NavSection title="Administration">
              <NavItem to="/admin/users" icon="👤">Utilisateurs</NavItem>
            </NavSection>
          )}
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 14,
            padding: '0 var(--sp-6)',
            height: 'var(--header-h)',
            flexShrink: 0,
            borderBottom: '1px solid var(--b)',
            background: 'var(--bg)',
          }}
        >
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost hamburger-btn"
            aria-label="Ouvrir le menu"
            style={{ padding: '8px 10px', marginRight: 'auto' }}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'var(--v1l)',
                color: 'var(--v1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {initials(user?.displayName)}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--t2)' }}>
              {user?.displayName} <span style={{ color: 'var(--t3)' }}>· {user?.role}</span>
            </span>
          </div>
          <button onClick={logout} className="btn btn-ghost">
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
