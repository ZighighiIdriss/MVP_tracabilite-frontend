// =============================================================================
// Layout.jsx — Structure globale (Navbar + contenu)
// Emplacement : src/components/layout/Layout.jsx
// =============================================================================
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ══════════════════════════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════════════════════════ */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          {/* ── Gauche : Titre ──────────────────────────────────────── */}
          <span style={styles.brand}>SUSTAINABLE PHARMA</span>

          {/* ── Centre : Liens ─────────────────────────────────────── */}
          <div style={styles.links}>
            <NavLink
              to="/dashboard"
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              Tableau de bord
            </NavLink>
            <NavLink
              to="/products/new"
              style={({ isActive }) => ({
                ...styles.link,
                ...(isActive ? styles.linkActive : {}),
              })}
            >
              Ajouter un lot
            </NavLink>
          </div>

          {/* ── Droite : Session ───────────────────────────────────── */}
          <div style={styles.session}>
            <span style={styles.email}>
              {user?.email}
            </span>
            {user?.isDemo && (
              <span style={styles.demoBadge}>DÉMO</span>
            )}
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--status-annule)';
                e.currentTarget.style.borderColor = 'var(--status-annule)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-neutral-500)';
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          CONTENU (pages enfants via Outlet)
          ══════════════════════════════════════════════════════════════════ */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--color-neutral-200)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  navInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'var(--space-3) var(--space-6)',
    gap: 'var(--space-6)',
  },
  brand: {
    fontWeight: 800,
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-emerald-700)',
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
  },
  link: {
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-neutral-500)',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    borderBottom: '2px solid transparent',
    transition: 'all var(--transition-fast)',
  },
  linkActive: {
    color: 'var(--color-emerald-700)',
    fontWeight: 600,
    borderBottomColor: 'var(--color-emerald-500)',
    background: 'var(--color-emerald-50)',
  },
  session: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flexShrink: 0,
  },
  email: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-neutral-600)',
    fontWeight: 500,
  },
  demoBadge: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    color: 'var(--color-gold-500)',
    background: 'var(--color-gold-100)',
    padding: '2px var(--space-2)',
    borderRadius: 'var(--radius-full)',
    letterSpacing: '0.04em',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-neutral-500)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  main: {
    padding: 'var(--space-6) 0',
  },
};
