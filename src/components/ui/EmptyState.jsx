// =============================================================================
// EmptyState.jsx — État vide pour listes / tableaux
// =============================================================================

export default function EmptyState({ message = 'Aucune donnée à afficher', icon = '📭', action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">{icon}</span>
      <p className="empty-state__message">{message}</p>
      {action && (
        <div className="empty-state__action">{action}</div>
      )}
    </div>
  );
}
