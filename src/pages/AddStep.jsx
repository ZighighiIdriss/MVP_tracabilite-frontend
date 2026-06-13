// =============================================================================
// AddStep.jsx — Écran : Valider une étape de traçabilité (Poka-yoke)
// L'opérateur ne choisit plus l'étape : elle est déterminée automatiquement
// via le paramètre `nextStepName` de l'URL (code DB exact).
// Synchro : AddStepRequest { stepName, date, description, location }
// Endpoint : addStep(productId, formData)
// =============================================================================
import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { addStep } from '../services/api';
import { STEP_LABELS } from '../components/business/Timeline';

const AddStep = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Récupère le code de la prochaine étape depuis l'URL (ex: TRANSFORMATION)
  const nextStepCode = searchParams.get('nextStepName') || '';
  const nextStepLabel = STEP_LABELS[nextStepCode] || nextStepCode;

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 16),
    location: 'Casablanca',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Mise à jour des champs ───────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  // ── Validation locale ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!nextStepCode) errs.stepName = "Le nom de l'étape n'est pas défini dans l'URL";
    if (!form.date) errs.date = 'La date est obligatoire';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Soumission ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    try {
      const payload = {
        // ========== MODIFIÉ : stepName (String) au lieu de typeId (Number) ==========
        stepName: nextStepCode,
        date: form.date + ':00',
        location: form.location || null,
        description: form.description || null,
      };
      await addStep(productId, payload);
      navigate(`/products/${productId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de l'ajout de l'étape.");
    } finally {
      setSubmitting(false);
    }
  };

  // Vérification initiale : le code d'étape doit être présent dans l'URL
  if (!nextStepCode) {
    return (
      <div className="container form-page-container">
        <div className="empty-state">
          <span className="empty-state__icon">⚠️</span>
          <p className="empty-state__message">
            Aucune étape spécifiée dans l'URL. Retournez à la fiche produit.
          </p>
          <button className="btn-primary" onClick={() => navigate(`/products/${productId}`)}>
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container form-page-container">
      {/* En-tête */}
      <header className="form-page__header animate-fade-in">
        <button className="btn-back" onClick={() => navigate(`/products/${productId}`)}>
          ← Retour à la fiche
        </button>
        <h1 className="heading-1">Valider une étape</h1>
        <p className="text-muted">Lot #{productId} — Validation de l'étape suivante</p>
      </header>

      {/* Badge de l'étape à valider (figé, non modifiable) */}
      <div className="step-validation-banner card animate-fade-in-up">
        <div className="step-validation-banner__icon">▶</div>
        <div className="step-validation-banner__content">
          <span className="step-validation-banner__label">Validation de l'étape</span>
          <span className="step-validation-banner__name">{nextStepLabel}</span>
        </div>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="login-error animate-fade-in" role="alert">
          <span className="login-error__icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Formulaire */}
      <form className="form-card card animate-fade-in-up" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Date */}
          <div className="form-group">
            <label htmlFor="field-step-date" className="form-label">Date *</label>
            <input
              id="field-step-date"
              type="datetime-local"
              className={`form-input ${fieldErrors.date ? 'form-input--error' : ''}`}
              value={form.date}
              onChange={handleChange('date')}
              disabled={submitting}
            />
            {fieldErrors.date && <span className="form-error">{fieldErrors.date}</span>}
          </div>

          {/* Lieu */}
          <div className="form-group">
            <label htmlFor="field-step-location" className="form-label">Lieu</label>
            <input
              id="field-step-location"
              type="text"
              className="form-input"
              placeholder="Ex : Casablanca"
              value={form.location}
              onChange={handleChange('location')}
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div className="form-group form-group--full">
            <label htmlFor="field-step-desc" className="form-label">Description</label>
            <textarea
              id="field-step-desc"
              className="form-textarea"
              rows={4}
              placeholder="Décrivez l'opération effectuée..."
              value={form.description}
              onChange={handleChange('description')}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(`/products/${productId}`)}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="btn-spinner" />
                Enregistrement...
              </>
            ) : (
              '✓ Valider l\'étape'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStep;
