// =============================================================================
// ProductDetail.jsx — Fiche produit complète
// Sections : Hero · Transition de statut · Timeline unifiée · Ajout · Admin
// Consomme : getProductById, addStep, updateProduct, deleteStep
// =============================================================================
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, addStep, updateProduct, deleteStep } from '../services/api';
import { PRODUCT_TYPES, MATERIALS } from '../config/constants';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';
import Timeline, { STEP_LABELS } from '../components/business/Timeline';

/** Retourne la date/heure locale pour datetime-local */
const getLocalDateTimeValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const initialStepForm = () => ({
  stepName: '',
  date: getLocalDateTimeValue(),
  location: '',
  description: '',
});

/** Résout le label d'une étape (standard ou personnalisée) */
const resolveStepLabel = (type) => STEP_LABELS[type] || type || '—';

/** Formate une date ISO */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch { return dateStr; }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── États principaux ───────────────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── État transition de statut ──────────────────────────────────────────
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // ── État formulaire d'ajout ────────────────────────────────────────────
  const [showAddStepForm, setShowAddStepForm] = useState(false);
  const [stepForm, setStepForm] = useState(initialStepForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ── État suppression ──────────────────────────────────────────────────
  const [deletingStepId, setDeletingStepId] = useState(null);

  // ── Chargement du produit ──────────────────────────────────────────────
  const loadProduct = useCallback(async () => {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Produit introuvable.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadProduct(); }, [loadProduct]);

  // ── Étapes triées chronologiquement ────────────────────────────────────
  const sortedSteps = (product?.steps || []).slice().sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });

  // ══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ══════════════════════════════════════════════════════════════════════

  // ── Transition de statut ───────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    setStatusUpdating(true);
    try {
      await updateProduct(id, { statusName: selectedStatus });
      await loadProduct();
      setSelectedStatus('');
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  // ── Ajout d'étape ─────────────────────────────────────────────────────
  const handleFieldChange = (field) => (e) => {
    setStepForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormError('');
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!stepForm.stepName.trim()) {
      setFormError("Veuillez saisir le nom de l'étape.");
      return;
    }
    if (!stepForm.date) {
      setFormError('Veuillez renseigner une date.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await addStep(id, {
        stepName: stepForm.stepName.trim(),
        date: stepForm.date + ':00',
        location: stepForm.location || null,
        description: stepForm.description || null,
      });
      await loadProduct();
      setStepForm(initialStepForm());
      setShowAddStepForm(false);
    } catch (err) {
      setFormError(err?.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Suppression d'étape ───────────────────────────────────────────────
  const handleDeleteStep = async (stepId) => {
    if (!window.confirm('Supprimer cette étape ? Cette action est irréversible.')) return;
    setDeletingStepId(stepId);
    try {
      await deleteStep(stepId);
      await loadProduct();
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingStepId(null);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDU
  // ══════════════════════════════════════════════════════════════════════

  if (isLoading) return <Loader message="Chargement de la fiche produit..." />;

  if (error || !product) {
    return (
      <div className="container form-page-container">
        <div className="empty-state">
          <span className="empty-state__icon">⚠️</span>
          <p className="empty-state__message">{error || 'Produit introuvable.'}</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  const typeLabel = PRODUCT_TYPES[product?.type]?.label || product?.type;
  const materialLabel = MATERIALS[product?.material]?.label || product?.material;

  return (
    <div className="container form-page-container" style={{ maxWidth: '960px' }}>
      {/* Navigation */}
      <header className="form-page__header animate-fade-in">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Tableau de bord
        </button>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 : EN-TÊTE PRODUIT (HERO)
          ══════════════════════════════════════════════════════════════════ */}
      <section className="product-detail__hero card animate-fade-in-up">
        <div className="product-detail__hero-top">
          <div className="product-detail__code-block">
            <span className="product-detail__code">{product?.productCode}</span>
            <Badge status={product?.currentStatus} />
          </div>
        </div>
        <div className="product-detail__info-grid">
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Type</span>
            <span className="product-detail__info-value">{typeLabel}</span>
          </div>
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Matière</span>
            <span className="product-detail__info-value">{materialLabel}</span>
          </div>
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Quantité</span>
            <span className="product-detail__info-value">
              {product?.quantity != null ? `${product.quantity} kg` : '—'}
            </span>
          </div>
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Collecte</span>
            <span className="product-detail__info-value">{formatDate(product?.collectionDate)}</span>
          </div>
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Fournisseur</span>
            <span className="product-detail__info-value">
              {product?.supplierName || '—'}
              {product?.supplierCode && (
                <small className="product-detail__supplier-code"> ({product.supplierCode})</small>
              )}
            </span>
          </div>
          <div className="product-detail__info-item">
            <span className="product-detail__info-label">Étapes</span>
            <span className="product-detail__info-value">{sortedSteps.length}</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 : TRANSITION DE STATUT (DROPDOWN)
          ══════════════════════════════════════════════════════════════════ */}
      {sortedSteps.length > 0 && (
        <section
          className="card animate-fade-in-up"
          style={{
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            borderLeft: '3px solid var(--color-gold-400)',
            animationDelay: '80ms',
          }}
        >
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 className="heading-3"> Transition de statut</h2>
            <p className="text-muted">
              Choisissez l'étape correspondant au statut actuel de ce lot.
              Statut courant : <strong style={{ color: 'var(--color-emerald-600)' }}>
                {resolveStepLabel(product?.currentStatus)}
              </strong>
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}>
            <select
              id="status-transition-select"
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={statusUpdating}
              style={{ flex: 1, minWidth: '200px' }}
            >
              <option value="">— Sélectionner une étape —</option>
              {sortedSteps.map((step) => (
                <option key={step.id} value={step.type}>
                  {resolveStepLabel(step.type)}
                  {step.type === product?.currentStatus ? ' (actuel)' : ''}
                </option>
              ))}
            </select>

            <button
              className="btn-primary"
              onClick={handleStatusUpdate}
              disabled={!selectedStatus || statusUpdating || selectedStatus === product?.currentStatus}
            >
              {statusUpdating ? (
                <>
                  <span className="btn-spinner" />
                  Mise à jour...
                </>
              ) : (
                ' Mettre à jour le statut'
              )}
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 : TIMELINE UNIFIÉE
          ══════════════════════════════════════════════════════════════════ */}
      <section
        className="card animate-fade-in-up"
        style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          animationDelay: '160ms',
        }}
      >
        <h2 className="heading-3" style={{ marginBottom: 'var(--space-6)' }}>
          Timeline du lot
        </h2>
        <Timeline product={product} />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 : AJOUT D'ÉTAPE
          ══════════════════════════════════════════════════════════════════ */}
      <section
        className="card animate-fade-in-up"
        style={{
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
          animationDelay: '240ms',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: showAddStepForm ? 'var(--space-5)' : 0,
        }}>
          <div>
            <h2 className="heading-3">➕ Ajouter une étape</h2>
            <p className="text-muted">Enregistrez une nouvelle étape personnalisée sur ce lot.</p>
          </div>
          <button
            className="btn-back"
            onClick={() => setShowAddStepForm((prev) => !prev)}
            style={{
              color: showAddStepForm ? 'var(--status-annule)' : 'var(--color-emerald-600)',
              borderColor: showAddStepForm ? 'var(--status-annule)' : 'var(--color-emerald-200)',
              background: showAddStepForm
                ? 'color-mix(in srgb, var(--status-annule) 6%, transparent)'
                : 'var(--color-emerald-50)',
              fontWeight: 600,
            }}
          >
            {showAddStepForm ? '✕ Fermer' : '➕ Nouveau'}
          </button>
        </div>

        {showAddStepForm && (
          <>
            {formError && (
              <div className="login-error animate-fade-in" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="login-error__icon">⚠️</span>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddStep}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="field-step-name" className="form-label">Nom de l'étape *</label>
                  <input
                    id="field-step-name"
                    type="text"
                    className="form-input"
                    placeholder="Ex : Contrôle qualité"
                    value={stepForm.stepName}
                    onChange={handleFieldChange('stepName')}
                    disabled={submitting}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="field-step-date" className="form-label">Date *</label>
                  <input
                    id="field-step-date"
                    type="datetime-local"
                    className="form-input"
                    value={stepForm.date}
                    onChange={handleFieldChange('date')}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="field-step-location" className="form-label">Lieu</label>
                  <input
                    id="field-step-location"
                    type="text"
                    className="form-input"
                    placeholder="Ex : Casablanca"
                    value={stepForm.location}
                    onChange={handleFieldChange('location')}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label htmlFor="field-step-desc" className="form-label">Description</label>
                  <textarea
                    id="field-step-desc"
                    className="form-textarea"
                    rows={3}
                    placeholder="Décrivez l'opération effectuée..."
                    value={stepForm.description}
                    onChange={handleFieldChange('description')}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-back"
                  onClick={() => { setShowAddStepForm(false); setStepForm(initialStepForm()); setFormError(''); }}
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (<><span className="btn-spinner" /> Enregistrement...</>) : '✓ Ajouter l\'étape'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 5 : ADMINISTRATION DES ÉTAPES (SUPPRESSION)
          ══════════════════════════════════════════════════════════════════ */}
      {sortedSteps.length > 0 && (
        <section
          className="card animate-fade-in-up"
          style={{
            padding: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            animationDelay: '320ms',
          }}
        >
          <h2 className="heading-3" style={{ marginBottom: 'var(--space-5)' }}>
            Administration des étapes du lot
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={adminTableStyles.table}>
              <thead>
                <tr>
                  <th style={adminTableStyles.th}>#</th>
                  <th style={adminTableStyles.th}>Étape</th>
                  <th style={adminTableStyles.th}>Date</th>
                  <th style={adminTableStyles.th}>Lieu</th>
                  <th style={{ ...adminTableStyles.th, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedSteps.map((step, index) => (
                  <tr
                    key={step.id || index}
                    style={adminTableStyles.tr}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ ...adminTableStyles.td, fontWeight: 700, color: 'var(--color-neutral-400)', width: '40px', textAlign: 'center' }}>
                      {index + 1}
                    </td>
                    <td style={{ ...adminTableStyles.td, fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                      {resolveStepLabel(step.type)}
                      {step.type === product?.currentStatus && (
                        <span style={{
                          marginLeft: 'var(--space-2)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          color: 'var(--color-emerald-600)',
                          background: 'var(--color-emerald-50)',
                          padding: '2px var(--space-2)',
                          borderRadius: 'var(--radius-full)',
                        }}>
                          actuel
                        </span>
                      )}
                    </td>
                    <td style={{ ...adminTableStyles.td, color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
                      {step.date ? new Date(step.date).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td style={adminTableStyles.td}>
                      {step.location || '—'}
                    </td>
                    <td style={{ ...adminTableStyles.td, textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        disabled={deletingStepId === step.id}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-neutral-200)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-1) var(--space-3)',
                          cursor: deletingStepId === step.id ? 'wait' : 'pointer',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          fontFamily: 'var(--font-family)',
                          color: 'var(--status-annule)',
                          transition: 'all var(--transition-fast)',
                          opacity: deletingStepId === step.id ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deletingStepId !== step.id) {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--status-annule) 8%, transparent)';
                            e.currentTarget.style.borderColor = 'var(--status-annule)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                        }}
                      >
                        {deletingStepId === step.id ? '⏳' : '🗑️'} Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

// ── Styles du tableau admin ──────────────────────────────────────────────
const adminTableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 'var(--font-size-sm)',
  },
  th: {
    padding: 'var(--space-3) var(--space-4)',
    textAlign: 'left',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 700,
    color: 'var(--color-neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '2px solid var(--color-neutral-200)',
    whiteSpace: 'nowrap',
  },
  tr: {
    transition: 'background var(--transition-fast)',
    borderBottom: '1px solid var(--color-neutral-100)',
  },
  td: {
    padding: 'var(--space-3) var(--space-4)',
    color: 'var(--color-neutral-700)',
    verticalAlign: 'middle',
  },
};

export default ProductDetail;
