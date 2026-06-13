// =============================================================================
// ProductCard.jsx — Carte produit premium
// Props : product { id, productCode, type, material, quantity, currentStatus }
// Synchro : ProductDTO.java, PRODUCT_TYPES, MATERIALS (constants.js)
// =============================================================================
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { PRODUCT_TYPES, MATERIALS } from '../../config/constants';

export default function ProductCard({ product }) {
  const {
    id,
    productCode,
    type,
    material,
    quantity,
    currentStatus,
  } = product;

  const typeLabel = PRODUCT_TYPES[type]?.label || type;
  const materialLabel = MATERIALS[material]?.label || material;

  return (
    <Link to={`/products/${id}`} className="product-card card glass animate-fade-in-up">
      <div className="product-card__header">
        <span className="product-card__code">{productCode}</span>
        <Badge status={currentStatus} />
      </div>

      <div className="product-card__body">
        <div className="product-card__row">
          <span className="product-card__label">Type</span>
          <span className="product-card__value">{typeLabel}</span>
        </div>
        <div className="product-card__row">
          <span className="product-card__label">Matière</span>
          <span className="product-card__value">{materialLabel}</span>
        </div>
        <div className="product-card__row">
          <span className="product-card__label">Quantité</span>
          <span className="product-card__value">{quantity != null ? `${quantity} kg` : '—'}</span>
        </div>
      </div>

      <div className="product-card__footer">
        <span className="product-card__link">Voir le détail →</span>
      </div>
    </Link>
  );
}
