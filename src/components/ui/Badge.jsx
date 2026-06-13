// =============================================================================
// Badge.jsx — Badge de statut dynamique
// Synchro : PRODUCT_STATUSES (constants.js) → data.sql statuses
// =============================================================================
import { PRODUCT_STATUSES } from '../../config/constants';

const DEFAULT_STATUS = {
  label: 'Inconnu',
  color: 'status-default',
  hex: '#a8a49c',
};

export default function Badge({ status }) {
  const config = PRODUCT_STATUSES[status] || DEFAULT_STATUS;

  return (
    <span
      className={`badge badge--${config.color}`}
      style={
        !PRODUCT_STATUSES[status]
          ? { background: 'rgba(168,164,156,0.14)', color: config.hex }
          : undefined
      }
    >
      <span className="badge__dot" style={{ backgroundColor: config.hex }} />
      {config.label}
    </span>
  );
}
