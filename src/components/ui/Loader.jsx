// =============================================================================
// Loader.jsx — Spinner industriel épuré
// =============================================================================

export default function Loader({ message = 'Chargement...' }) {
  return (
    <div className="loader">
      <div className="loader__spinner" />
      {message && <p className="loader__text">{message}</p>}
    </div>
  );
}
