// =============================================================================
// PrivateRoute.jsx — Gardien de routes protégées
// =============================================================================
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Vérification de session en cours
  if (loading) {
    return (
      <div className="app-shell">
        <p className="text-muted">Chargement de la session...</p>
      </div>
    );
  }

  // Non connecté → redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Connecté → rendu des routes enfants
  return <Outlet />;
}
