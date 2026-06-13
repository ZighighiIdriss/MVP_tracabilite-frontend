// =============================================================================
// Dashboard.jsx — Tableau de bord avec Data Table
// Consomme : AuthContext, getDashboardStats(), getAllProducts()
// Style   : Design system existant (émeraude · sauge · or · neutres chauds)
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getAllProducts } from '../services/api';
import { PRODUCT_STATUSES, PRODUCT_TYPES } from '../config/constants';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import { MANDATORY_STEPS, STEP_LABELS } from '../components/business/Timeline';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formate une date ISO en YYYY-MM-DD lisible */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toISOString().slice(0, 10);
  } catch {
    return '—';
  }
};

/** Résout le label d'un type produit (objet ou string) */
const resolveTypeLabel = (type) => {
  if (!type) return '—';
  // Si c'est un objet {name: "FLO", ...}
  const key = typeof type === 'string' ? type : type.name;
  return PRODUCT_TYPES[key]?.label || key || '—';
};

/** Résout le nom du statut (objet ou string) */
const resolveStatusName = (status) => {
  if (!status) return '';
  return typeof status === 'string' ? status : status.name || '';
};

// ── Composant Dashboard ──────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const INITIAL_LIMIT = 5;

  // Chargement au montage
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [statsData, productsData] = await Promise.all([
          getDashboardStats(),
          getAllProducts(),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Impossible de charger les données.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);



  // ── Calculs dynamiques ───────────────────────────────────────────────────
  const activeProducts = products.filter(
    (p) => resolveStatusName(p.currentStatus) !== 'TERMINE'
  ).length;

  const finishedProducts = products.filter(
    (p) => resolveStatusName(p.currentStatus) === 'TERMINE'
  ).length;

  // ── Liste dynamique combinée des statuts pour le filtre ────────────────
  const dynamicStatuses = products
    .map((p) => resolveStatusName(p.currentStatus))
    .filter(Boolean);

  const availableStatuses = Array.from(
    new Set([...MANDATORY_STEPS, ...dynamicStatuses])
  ).filter((status) => status.toUpperCase() !== 'ANNULE' && status.toUpperCase() !== 'ANNULÉ');

  // ── État : Chargement ──────────────────────────────────────────────────
  if (isLoading) {
    return <Loader message="Chargement des données de l'usine..." />;
  }

  // ── État : Erreur ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container dashboard-container">
        <div className="empty-state">
          <span className="empty-state__icon">⚠️</span>
          <p className="empty-state__message">{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container">
      {/* ── En-tête ───────────────────────────────────────────────────── */}
      <header className="dashboard__header animate-fade-in">
        <div className="dashboard__header-left">
          <h1 className="heading-1">Tableau de bord</h1>
        </div>
      </header>

      {/* ── Section Statistiques ──────────────────────────────────────── */}
      <section className="dashboard__section animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="stats-grid stagger" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '500px' }}>
          {/* Carte : Produits actifs */}
          <div className="stat-card card animate-fade-in-up" style={{ padding: 'var(--space-5) var(--space-6)' }}>
            <span className="stat-card__value" style={{ color: 'var(--color-gold-500)' }}>
              {activeProducts}
            </span>
            <span className="stat-card__label">Produits actifs</span>
          </div>

          {/* Carte : Produits finis */}
          <div className="stat-card card animate-fade-in-up" style={{ padding: 'var(--space-5) var(--space-6)' }}>
            <span className="stat-card__value" style={{ color: 'var(--status-termine)' }}>
              {finishedProducts}
            </span>
            <span className="stat-card__label">Produits finis</span>
          </div>
        </div>
      </section>

      {/* ── Barre de filtres ───────────────────────────────────────── */}
      <section
        className="dashboard__section animate-fade-in-up"
        style={{ animationDelay: '120ms' }}
      >
        <div style={filterBarStyles.container}>
          {/* Filtre Statut */}
          <div style={filterBarStyles.field}>
            <label htmlFor="filter-status" style={filterBarStyles.label}>Statut</label>
            <select
              id="filter-status"
              className="form-select"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setIsExpanded(false); }}
              style={filterBarStyles.input}
            >
              <option value="">Tous les statuts</option>
              {availableStatuses.map((status) => {
                const displayLabel = STEP_LABELS[status] || status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
                return (
                  <option key={status} value={status}>
                    {displayLabel}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Filtre Date */}
          <div style={filterBarStyles.field}>
            <label htmlFor="filter-date" style={filterBarStyles.label}>Date de collecte</label>
            <input
              id="filter-date"
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setIsExpanded(false); }}
              style={filterBarStyles.input}
            />
          </div>

          {/* Réinitialiser */}
          {(selectedStatus || selectedDate) && (
            <button
              onClick={() => { setSelectedStatus(''); setSelectedDate(''); setIsExpanded(false); }}
              style={filterBarStyles.resetBtn}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--status-annule)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-neutral-500)'; }}
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      {/* ── Section Data Table ────────────────────────────────────────── */}
      <section className="dashboard__section animate-fade-in-up" style={{ animationDelay: '160ms' }}>
        <h2 className="heading-3">Liste des produits</h2>

        {(() => {
          // A. FILTRAGE
          const filteredProducts = products.filter((product) => {
            const statusName = resolveStatusName(product.currentStatus);
            const matchesStatus = !selectedStatus || statusName === selectedStatus;
            const matchesDate = !selectedDate || (product.collectionDate && product.collectionDate.startsWith(selectedDate));
            return matchesStatus && matchesDate;
          });

          // B. TRI (actifs en haut, terminés en bas)
          const sortedProducts = [...filteredProducts].sort((a, b) => {
            const isATermine = resolveStatusName(a.currentStatus) === 'TERMINE';
            const isBTermine = resolveStatusName(b.currentStatus) === 'TERMINE';
            if (isATermine && !isBTermine) return 1;
            if (!isATermine && isBTermine) return -1;
            return 0;
          });

          // C. COUPURE
          const displayedProducts = isExpanded ? sortedProducts : sortedProducts.slice(0, INITIAL_LIMIT);

          if (filteredProducts.length === 0) {
            return (
              <EmptyState
                message={
                  (selectedStatus || selectedDate)
                    ? 'Aucun produit ne correspond aux filtres sélectionnés.'
                    : 'Aucun produit enregistré pour le moment.'
                }
                action={
                  (selectedStatus || selectedDate) ? (
                    <button
                      className="btn-back"
                      onClick={() => { setSelectedStatus(''); setSelectedDate(''); }}
                    >
                      Réinitialiser les filtres
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={() => navigate('/products/new')}>
                      + Créer un premier produit
                    </button>
                  )
                }
              />
            );
          }

          return (
            <>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-xl)' }}>
            <table style={tableStyles.table}>
              <thead>
                <tr>
                  {['Code Produit', 'Type', 'Quantité', 'Date', 'Statut', 'Action'].map((col) => (
                    <th key={col} style={tableStyles.th}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product, index) => {
                  const statusName = resolveStatusName(product.currentStatus);
                  const statusConfig = PRODUCT_STATUSES[statusName];

                  return (
                    <tr
                      key={product.id}
                      style={{
                        ...tableStyles.tr,
                        animationDelay: `${index * 30}ms`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-neutral-50)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Code Produit */}
                      <td style={tableStyles.td}>
                        <span style={tableStyles.productCode}>
                          {product.productCode || '—'}
                        </span>
                      </td>

                      {/* Type */}
                      <td style={tableStyles.td}>
                        <span style={tableStyles.typeBadge}>
                          {resolveTypeLabel(product.type)}
                        </span>
                      </td>

                      {/* Quantité */}
                      <td style={tableStyles.td}>
                        {product.quantity != null ? `${product.quantity} kg` : '—'}
                      </td>

                      {/* Date */}
                      <td style={tableStyles.td}>
                        <span style={{ color: 'var(--color-neutral-500)' }}>
                          {formatDate(product.collectionDate)}
                        </span>
                      </td>

                      {/* Statut */}
                      <td style={tableStyles.td}>
                        <StatusBadge statusName={statusName} config={statusConfig} />
                      </td>

                      {/* Action */}
                      <td style={tableStyles.td}>
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          style={tableStyles.actionLink}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-emerald-500)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-emerald-600)';
                          }}
                        >
                          Consulter &gt;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bouton Voir plus / Voir moins */}
          {sortedProducts.length > INITIAL_LIMIT && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-6)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  fontFamily: 'var(--font-family)',
                  color: 'var(--color-neutral-600)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-neutral-50)';
                  e.currentTarget.style.borderColor = 'var(--color-neutral-300)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                }}
              >
                {isExpanded
                  ? 'Voir moins'
                  : `Voir tout (${sortedProducts.length} produits)`
                }
              </button>
            </div>
          )}
            </>
          );
        })()}
      </section>
    </div>
  );
};

// ── Sous-composant : Badge de statut ─────────────────────────────────────────

function StatusBadge({ statusName, config }) {
  if (!statusName) {
    return <span style={tableStyles.statusDefault}>—</span>;
  }

  const STEP_COLORS = {
    RECEPTION_MATIERE:       "#4b5563",
    TRANSFORMATION:          "#d97706",
    PURIFICATION_EXTRACTION: "#7c3aed",
    CONDITIONNEMENT:         "#0284c7",
    TERMINE:                 "#16a34a",
  };

  const hex = STEP_COLORS[statusName] || config?.hex || '#a8a49c';
  const bgColor = `color-mix(in srgb, ${hex} 12%, transparent)`;
  const displayLabel = config?.label || statusName.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-3)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderRadius: 'var(--radius-full)',
        whiteSpace: 'nowrap',
        background: bgColor,
        color: hex,
        border: `1px solid color-mix(in srgb, ${hex} 20%, transparent)`,
      }}
    >
      {displayLabel}
    </span>
  );
}

// ── Styles du tableau (réutilisant les tokens du design system) ──────────────

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    background: 'var(--bg-surface)',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  th: {
    padding: 'var(--space-4) var(--space-5)',
    textAlign: 'left',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    background: 'var(--color-neutral-50)',
    borderBottom: '1px solid var(--color-neutral-200)',
    whiteSpace: 'nowrap',
  },
  tr: {
    transition: 'background var(--transition-fast)',
    animation: 'fade-in var(--transition-slow) both',
  },
  td: {
    padding: 'var(--space-4) var(--space-5)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-neutral-700)',
    borderBottom: '1px solid var(--color-neutral-100)',
    whiteSpace: 'nowrap',
  },
  productCode: {
    fontWeight: 700,
    fontFamily: "'Courier New', monospace",
    color: 'var(--color-emerald-700)',
    background: 'var(--color-emerald-50)',
    padding: 'var(--space-1) var(--space-3)',
    borderRadius: 'var(--radius-md)',
    letterSpacing: '0.03em',
    fontSize: 'var(--font-size-sm)',
  },
  typeBadge: {
    display: 'inline-block',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 500,
    color: 'var(--color-neutral-600)',
    background: 'var(--color-neutral-100)',
    borderRadius: 'var(--radius-md)',
  },
  actionLink: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-emerald-600)',
    fontFamily: 'var(--font-family)',
    padding: 0,
    transition: 'color var(--transition-fast)',
  },
  statusDefault: {
    color: 'var(--color-neutral-400)',
    fontSize: 'var(--font-size-xs)',
  },
};

// ── Styles de la barre de filtres ────────────────────────────────────────────

const filterBarStyles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 'var(--space-4)',
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--bg-surface)',
    border: '1px solid var(--color-neutral-100)',
    borderRadius: 'var(--radius-lg)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
    minWidth: '180px',
  },
  label: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 600,
    color: 'var(--color-neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  input: {
    fontSize: 'var(--font-size-sm)',
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    fontFamily: 'var(--font-family)',
    color: 'var(--color-neutral-500)',
    padding: 'var(--space-2) 0',
    transition: 'color var(--transition-fast)',
    whiteSpace: 'nowrap',
  },
};

export default Dashboard;
