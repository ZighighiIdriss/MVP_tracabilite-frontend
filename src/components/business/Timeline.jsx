// =============================================================================
// Timeline.jsx — Frise chronologique unifiée
// Emplacement : src/components/business/Timeline.jsx
// Props : product { currentStatus, steps[] }
//
// Fusionne TOUTES les étapes dans une timeline unique triée par date.
// La logique des badges est basée sur l'INDEX chronologique :
//   - index < currentIndex  → Vert   "✓ Validée"
//   - index === currentIndex → Or     "● Statut actuel"
//   - index > currentIndex  → Gris   "○ À venir"
// =============================================================================

// ── Identifiants des étapes du processus industriel ───────────────────────
const MANDATORY_STEPS = [
  "RECEPTION_MATIERE",
  "TRANSFORMATION",
  "PURIFICATION_EXTRACTION",
  "CONDITIONNEMENT",
  "TERMINE",
];

// ── Labels d'affichage pour les étapes industrielles ──────────────────────
const STEP_LABELS = {
  RECEPTION_MATIERE:       "Réception matière",
  TRANSFORMATION:          "Transformation",
  PURIFICATION_EXTRACTION: "Purification / extraction",
  CONDITIONNEMENT:         "Conditionnement",
  TERMINE:                 "Terminé",
};

// ── Icônes par étape industrielle ─────────────────────────────────────────
const STEP_ICONS = {
  RECEPTION_MATIERE:       "📦",
  TRANSFORMATION:          "⚗️",
  PURIFICATION_EXTRACTION: "🧪",
  CONDITIONNEMENT:         "📋",
  TERMINE:                 "✓",
};

// ── Couleurs par étape industrielle ───────────────────────────────────
const STEP_COLORS = {
  RECEPTION_MATIERE:       "#4b5563",
  TRANSFORMATION:          "#d97706",
  PURIFICATION_EXTRACTION: "#7c3aed",
  CONDITIONNEMENT:         "#0284c7",
  TERMINE:                 "#16a34a",
};

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

/** Résout le label à afficher pour une étape */
function resolveLabel(stepType) {
  return STEP_LABELS[stepType] || stepType || 'Étape sans nom';
}

/** Résout l'icône pour une étape */
function resolveIcon(stepType) {
  return STEP_ICONS[stepType] || '📝';
}

/** Détermine si un type d'étape fait partie du processus obligatoire */
function isMandatoryStep(stepType) {
  return MANDATORY_STEPS.includes(stepType);
}

export default function Timeline({ product }) {
  const steps = product?.steps || [];
  const currentStatus = product?.currentStatus || '';

  // ── Fusion & tri chronologique de TOUTES les étapes ────────────────────
  const sortedSteps = [...steps].sort((a, b) => {
    // RÈGLE ABSOLUE : L'étape TERMINE est toujours repoussée à la fin
    if (a.type === 'TERMINE') return 1;
    if (b.type === 'TERMINE') return -1;

    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });

  if (sortedSteps.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon">📋</span>
        <p className="empty-state__message">Aucune étape enregistrée.</p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // CALCUL DE L'INDEX DU STATUT COURANT
  // Toutes les étapes à cet index ou avant → validées
  // L'étape à cet index → statut actuel (gold)
  // Les étapes après → à venir (gris)
  // ══════════════════════════════════════════════════════════════════════
  const currentIndex = sortedSteps.findIndex((s) => s.type === currentStatus);

  return (
    <div className="stepper">
      {sortedSteps.map((step, index) => {
        const stepType = step.type || '';
        const mandatory = isMandatoryStep(stepType);
        const icon = resolveIcon(stepType);
        const label = resolveLabel(stepType);
        const stepColor = STEP_COLORS[stepType] || '#64748b';

        // ── Détermination de la variante visuelle par INDEX ──────────
        let variant;
        if (currentIndex === -1) {
          // Aucun statut courant trouvé → tout est "completed" par défaut
          variant = 'completed';
        } else if (index < currentIndex) {
          variant = 'completed';
        } else if (index === currentIndex) {
          variant = 'current';
        } else {
          variant = 'upcoming';
        }

        return (
          <div
            key={step.id || `step-${index}`}
            className={`stepper__item stepper__item--${variant} animate-fade-in-up`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            {/* ── Rail : point + ligne ───────────────────────────────── */}
            <div className="stepper__rail">
              <div
                className={`stepper__dot stepper__dot--${variant}`}
                style={
                  variant === 'completed'
                    ? { backgroundColor: stepColor, borderColor: stepColor }
                    : variant === 'current'
                    ? { backgroundColor: 'var(--bg-surface)', borderColor: stepColor, borderWidth: '3px' }
                    : undefined
                }
              >
                {variant === 'completed' && (
                  <span className="stepper__check">✓</span>
                )}
                {variant === 'current' && (
                  <span className="stepper__icon" style={{ color: stepColor }}>•</span>
                )}
              </div>
              {index < sortedSteps.length - 1 && (
                <div className={`stepper__line stepper__line--${variant}`} />
              )}
            </div>

            {/* ── Contenu ────────────────────────────────────────────── */}
            <div
              className={`stepper__content card stepper__content--${variant}`}
              style={variant === 'current' ? { borderLeftColor: stepColor } : undefined}
            >
              <div className="stepper__header">
                <span className="stepper__step-number">
                  {mandatory ? 'Étape process' : 'Étape sur-mesure'}
                </span>
                <span 
                  className={`stepper__badge stepper__badge--${variant}`}
                  style={
                    variant === 'completed'
                      ? { background: `color-mix(in srgb, ${stepColor} 12%, transparent)`, color: stepColor }
                      : variant === 'current'
                      ? { background: stepColor, color: '#fff' }
                      : undefined
                  }
                >
                  {variant === 'completed' && '✓ Validée'}
                  {variant === 'current' && '● Statut actuel'}
                  {variant === 'upcoming' && '○ À venir'}
                </span>
              </div>

              <span className="stepper__type">{label}</span>

              {/* Détails : toujours affichés pour validées et current, masqués pour upcoming */}
              {variant !== 'upcoming' && (
                <div className="stepper__details">
                  {step.date && (
                    <p className="stepper__date">{formatDate(step.date)}</p>
                  )}
                  {step.location && (
                    <p className="stepper__location">{step.location}</p>
                  )}
                  {step.description && (
                    <p className="stepper__description">{step.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Export des constantes pour réutilisation
export { MANDATORY_STEPS, STEP_LABELS };
