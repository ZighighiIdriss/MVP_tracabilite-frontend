import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProductTypes,
  getMaterials,
  getSuppliers,
  getStepTypes,
  createProduct,
} from '../services/api';
import { MANDATORY_STEPS, STEP_LABELS } from '../components/business/Timeline';
import Loader from '../components/ui/Loader';

const CreateProduct = () => {
  const navigate = useNavigate();

  // Données de référence (dropdowns)
  const [productTypes, setProductTypes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stepTypes, setStepTypes] = useState([]);
  const [refLoading, setRefLoading] = useState(true);

  // Champs formulaire (on envoie les IDs bruts — factory pattern)
  const [form, setForm] = useState({
    typeId: '',
    materialId: '',
    supplierId: '',
    quantity: '',
    collectionDate: new Date().toISOString().slice(0, 16), // datetime-local
    initialStepId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Chargement des données de référence ──────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [types, mats, supps, steps] = await Promise.all([
          getProductTypes(),
          getMaterials(),
          getSuppliers(),
          getStepTypes(),
        ]);

        // 🔥 L'extracteur intelligent (Poka-yoke) 🔥
        // Il fouille dans la réponse pour trouver le tableau, peu importe si ça vient d'Axios ou de Fetch !
        const extractArray = (res) => {
          if (Array.isArray(res)) return res; // Si c'est déjà un tableau (Parfait !)
          if (res?.data && Array.isArray(res.data)) return res.data; // Si c'est caché dans res.data (Axios)
          if (res?.content && Array.isArray(res.content)) return res.content; // Si c'est de la pagination Spring
          console.warn("Format de données non reconnu :", res); // Pour t'aider à déboguer au cas où
          return [];
        };

        // On applique l'extracteur à chaque liste
        setProductTypes(extractArray(types));
        setMaterials(extractArray(mats));
        setSuppliers(extractArray(supps));
        setStepTypes(extractArray(steps));

      } catch (err) {
        console.error("Erreur lors du chargement des données API :", err);
        setError('Impossible de charger les données de référence.');
      } finally {
        setRefLoading(false);
      }
    };
    load();
  }, []);

  // ── Mise à jour des champs ───────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
  };

  // ── Validation locale ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.typeId) errs.typeId = 'Le type est obligatoire';
    if (!form.materialId) errs.materialId = 'La matière est obligatoire';
    if (!form.supplierId) errs.supplierId = 'Le fournisseur est obligatoire';
    if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = 'La quantité doit être positive';
    if (!form.collectionDate) errs.collectionDate = 'La date est obligatoire';
    if (!form.initialStepId) errs.initialStepId = "L'étape initiale est obligatoire";
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
        typeId: Number(form.typeId),
        materialId: Number(form.materialId),
        supplierId: Number(form.supplierId),
        quantity: Number(form.quantity),
        collectionDate: form.collectionDate + ':00',
        initialStepId: Number(form.initialStepId),
      };
      const created = await createProduct(payload);
      navigate(`/products/${created.id}`);
    } catch (err) {
      // Erreurs de validation backend
      if (err?.response?.data?.details) {
        setFieldErrors(err.response.data.details);
      } else {
        setError(err?.response?.data?.message || 'Erreur lors de la création du lot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (refLoading) {
    return <Loader message="Chargement des données de référence..." />;
  }

  return (
    <div className="container form-page-container">
      {/* En-tête */}
      <header className="form-page__header animate-fade-in">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Retour
        </button>
        <h1 className="heading-1">Enregistrer un nouveau lot</h1>
        <p className="text-muted">Le code produit sera généré automatiquement par le système.</p>
      </header>

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
          {/* Type */}
          <div className="form-group">
            <label htmlFor="field-type" className="form-label">Type de produit *</label>
            <select
              id="field-type"
              className={`form-select ${fieldErrors.typeId ? 'form-input--error' : ''}`}
              value={form.typeId}
              onChange={handleChange('typeId')}
              disabled={submitting}
            >
              <option value="">— Sélectionner —</option>
              {productTypes?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {fieldErrors.typeId && <span className="form-error">{fieldErrors.typeId}</span>}
          </div>

          {/* Matière */}
          <div className="form-group">
            <label htmlFor="field-material" className="form-label">Matière première *</label>
            <select
              id="field-material"
              className={`form-select ${fieldErrors.materialId ? 'form-input--error' : ''}`}
              value={form.materialId}
              onChange={handleChange('materialId')}
              disabled={submitting}
            >
              <option value="">— Sélectionner —</option>
              {materials?.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            {fieldErrors.materialId && <span className="form-error">{fieldErrors.materialId}</span>}
          </div>

          {/* Fournisseur */}
          <div className="form-group">
            <label htmlFor="field-supplier" className="form-label">Fournisseur *</label>
            <select
              id="field-supplier"
              className={`form-select ${fieldErrors.supplierId ? 'form-input--error' : ''}`}
              value={form.supplierId}
              onChange={handleChange('supplierId')}
              disabled={submitting}
            >
              <option value="">— Sélectionner —</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.supplierCode})
                </option>
              ))}
            </select>
            {fieldErrors.supplierId && <span className="form-error">{fieldErrors.supplierId}</span>}
          </div>

          {/* Quantité */}
          <div className="form-group">
            <label htmlFor="field-quantity" className="form-label">Quantité (kg) *</label>
            <input
              id="field-quantity"
              type="number"
              step="0.01"
              min="0.01"
              className={`form-input ${fieldErrors.quantity ? 'form-input--error' : ''}`}
              placeholder="Ex : 150.5"
              value={form.quantity}
              onChange={handleChange('quantity')}
              disabled={submitting}
            />
            {fieldErrors.quantity && <span className="form-error">{fieldErrors.quantity}</span>}
          </div>

          {/* Date de collecte */}
          <div className="form-group">
            <label htmlFor="field-date" className="form-label">Date de collecte *</label>
            <input
              id="field-date"
              type="datetime-local"
              className={`form-input ${fieldErrors.collectionDate ? 'form-input--error' : ''}`}
              value={form.collectionDate}
              onChange={handleChange('collectionDate')}
              disabled={submitting}
            />
            {fieldErrors.collectionDate && <span className="form-error">{fieldErrors.collectionDate}</span>}
          </div>

          {/* Étape actuelle en usine */}
          <div className="form-group">
            <label htmlFor="field-initial-step" className="form-label">Étape actuelle en usine *</label>
            <select
              id="field-initial-step"
              className={`form-select ${fieldErrors.initialStepId ? 'form-input--error' : ''}`}
              value={form.initialStepId}
              onChange={handleChange('initialStepId')}
              disabled={submitting}
            >
              <option value="">— Sélectionner —</option>
              {stepTypes
                ?.filter((st) => MANDATORY_STEPS.includes(st.name))
                .map((st) => (
                  <option key={st.id} value={st.id}>
                    {STEP_LABELS[st.name] || st.name}
                  </option>
                ))}
            </select>
            {fieldErrors.initialStepId && <span className="form-error">{fieldErrors.initialStepId}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate('/dashboard')}
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
                Création...
              </>
            ) : (
              '✓ Créer le lot'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
