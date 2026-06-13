// =============================================================================
// constants.js — Source unique de vérité Frontend ↔ Backend
// Synchronisé avec :
//   - data.sql          → statuses (id 1..5), step_types (id 1..4)
//   - ProductDTO.java   → clés : id, productCode, type, material, quantity,
//                          collectionDate, currentStatus, supplierCode,
//                          supplierName, steps, additionalInfo
//   - StepDTO.java      → clés : id, type, date, location, description,
//                          additionalInfo
//   - DashboardStatsDTO → clés : totalProducts, productsEnReception,
//                          productsEnTransformation, productsEnPurification,
//                          productsEnCours, productsTermines, productsAnnules,
//                          totalSteps
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Statuts produit  (valeurs identiques à statuses.name dans data.sql)
// ---------------------------------------------------------------------------
export const PRODUCT_STATUSES = {
  RECEPTION_MATIERE: {
    label: 'Réception Matière',
    color: 'status-reception',
    hex: '#2D9F83',        // Émeraude doux
  },
  TRANSFORMATION: {
    label: 'Transformation',
    color: 'status-transformation',
    hex: '#E8A838',        // Or ambré
  },
  PURIFICATION_EXTRACTION: {
    label: 'Purification / Extraction',
    color: 'status-purification',
    hex: '#7C9A72',        // Sauge profond
  },
  TERMINE: {
    label: 'Terminé',
    color: 'status-termine',
    hex: '#4ECDC4',        // Turquoise clair
  },
  ANNULE: {
    label: 'Annulé',
    color: 'status-annule',
    hex: '#E76F6F',        // Corail doux
  },
};

// ---------------------------------------------------------------------------
// 2. Types d'étape  (valeurs identiques à step_types.name dans data.sql)
// ---------------------------------------------------------------------------
export const STEP_TYPES = {
  RECEPTION_MATIERE: {
    label: 'Réception Matière',
    icon: '📦',
  },
  TRANSFORMATION: {
    label: 'Transformation',
    icon: '⚗️',
  },
  PURIFICATION_EXTRACTION: {
    label: 'Purification / Extraction',
    icon: '🧪',
  },
  CONDITIONNEMENT: {
    label: 'Conditionnement',
    icon: '📋',
  },
};

// ---------------------------------------------------------------------------
// 3. Types de produit  (valeurs identiques à product_types.name dans data.sql)
// ---------------------------------------------------------------------------
export const PRODUCT_TYPES = {
  FLO: { label: 'Eau Florale' },
  BIO: { label: 'Bioactif' },
  CAR: { label: 'Carrière' },
  HUI: { label: 'Huile Essentielle' },
};

// ---------------------------------------------------------------------------
// 4. Matières premières  (valeurs identiques à materials.name dans data.sql)
// ---------------------------------------------------------------------------
export const MATERIALS = {
  ROS: { label: 'Rose' },
  LAV: { label: 'Lavande' },
  ARG: { label: 'Arganier' },
  MEN: { label: 'Menthe' },
};

// ---------------------------------------------------------------------------
// 5. Clés du DashboardStatsDTO  (documentation — usage dans les services)
// ---------------------------------------------------------------------------
export const DASHBOARD_KEYS = {
  totalProducts:            'totalProducts',
  productsEnReception:      'productsEnReception',
  productsEnTransformation: 'productsEnTransformation',
  productsEnPurification:   'productsEnPurification',
  productsEnCours:          'productsEnCours',
  productsTermines:         'productsTermines',
  productsAnnules:          'productsAnnules',
  totalSteps:               'totalSteps',
};

// ---------------------------------------------------------------------------
// 6. API base URL
// ---------------------------------------------------------------------------
export const API_BASE_URL = '/api';
