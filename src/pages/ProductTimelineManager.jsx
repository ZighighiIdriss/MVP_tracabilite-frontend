import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductSteps } from '../services/api';
import Timeline, { MANDATORY_STEPS, STEP_LABELS } from '../components/business/Timeline';
import Loader from '../components/ui/Loader';
import Badge from '../components/ui/Badge';

/**
 * Formate une date ISO en format lisible français.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const ProductTimelineManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Chargement parallèle : produit + étapes ──────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [productData, stepsData] = await Promise.all([
          getProductById(id),
          getProductSteps(id),
        ]);
        if (!cancelled) {
          setProduct(productData);
          setSteps(Array.isArray(stepsData) ? stepsData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Impossible de charger les données.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Chargement ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <Loader message="Chargement de la traçabilité..." />;
  }

  // ── Erreur ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="container form-page-container">
        <div className="empty-state">
          <span className="empty-state__icon">⚠️</span>
          <p className="empty-state__message">{error || 'Données introuvables.'}</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ── Calcul de l'étape suivante ───────────────────────────────────────
  const currentIndex = MANDATORY_STEPS.indexOf(product?.currentStatus);
  const isLastStep = currentIndex >= MANDATORY_STEPS.length - 1;
  const nextStepCode = !isLastStep && currentIndex >= 0
    ? MANDATORY_STEPS[currentIndex + 1]
    : null;
  const nextStepLabel = nextStepCode ? STEP_LABELS[nextStepCode] : null;

  return (
    <div className="container form-page-container">
      {/* ── En-tête ────────────────────────────────────────────────────── */}
      <header className="form-page__header animate-fade-in">
        <button className="btn-back" onClick={() => navigate(`/products/${id}`)}>
          ← Retour à la fiche produit
        </button>

        <div className="timeline-manager__header">
          <div className="timeline-manager__title-block">
            <h1 className="heading-1">Gestion de la Traçabilité</h1>
            <p className="text-muted">
              Lot <strong>{product?.productCode || `#${id}`}</strong>
              {' — '}
              <Badge status={product?.currentStatus} />
            </p>
          </div>

          {/* Bouton dynamique : valider la prochaine étape ou badge fin */}
          {isLastStep ? (
            <span className="production-complete-badge">
              <span className="production-complete-badge__icon">✅</span>
              Cycle de production terminé
            </span>
          ) : nextStepCode ? (
            <button
              id="btn-validate-next-step"
              className="btn-primary btn-primary--action"
              onClick={() =>
                navigate(
                  `/products/${id}/steps/new?nextStepName=${encodeURIComponent(nextStepCode)}`
                )
              }
            >
              ▶ Valider la phase : {nextStepLabel}
            </button>
          ) : null}
        </div>
      </header>

      {/* ── Stepper visuel ─────────────────────────────────────────────── */}
      <section className="timeline-manager__stepper card animate-fade-in-up">
        <h2 className="heading-3">Processus de production</h2>
        <Timeline product={product} />
      </section>

      {/* ── Tableau récapitulatif des étapes ────────────────────────────── */}
      <section className="timeline-manager__table animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <h2 className="heading-3">Historique détaillé des étapes</h2>

        {steps?.length > 0 ? (
          <div className="steps-table-wrapper card">
            <table className="steps-table">
              <thead>
                <tr>
                  <th className="steps-table__th">#</th>
                  <th className="steps-table__th">Étape</th>
                  <th className="steps-table__th">Date</th>
                  <th className="steps-table__th">Lieu</th>
                  <th className="steps-table__th">Description</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step, index) => (
                  <tr key={step?.id || index} className="steps-table__tr">
                    <td className="steps-table__td steps-table__td--num">{index + 1}</td>
                    <td className="steps-table__td steps-table__td--type">
                      {STEP_LABELS[step?.type] || step?.type || '—'}
                    </td>
                    <td className="steps-table__td steps-table__td--date">
                      {formatDate(step?.date)}
                    </td>
                    <td className="steps-table__td">
                      {step?.location || '—'}
                    </td>
                    <td className="steps-table__td steps-table__td--desc">
                      {step?.description || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state__icon"></span>
            <p className="empty-state__message">Aucune étape enregistrée pour ce lot.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductTimelineManager;
