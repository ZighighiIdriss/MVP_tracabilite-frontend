// =============================================================================
// Login.jsx — Écran : S'authentifier / Mode Démo Opérateur
// Consomme : AuthContext (loginUser, loginAsDemo)
// =============================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginUser, loginAsDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Ajout état
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Déjà connecté → redirection
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et mot de passe.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Impossible de lancer le mode démo. Vérifiez que le serveur est en ligne.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />

      <div className="login-card card animate-fade-in-up">
        <div className="login-brand">
          <span className="login-brand__icon">🌿</span>
          <h1 className="login-title">SUSTAINABLE PHARMA</h1>
          <p className="login-subtitle">Système de suivi et traçabilité industrielle</p>
        </div>

        {error && (
          <div className="login-error animate-fade-in" role="alert">
            <span className="login-error__icon">⚠️</span>
            {error}
          </div>
        )}

        <form className="login-fields" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="operateur@entreprise.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Mot de passe</label>
            {/* Conteneur relatif pour positionner l'icône */}
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"} // Bascule le type
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: 0
                }}
              >
                {showPassword ? "👁" : "∅"}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>ou accès rapide</span>
        </div>

        <button
          id="btn-demo"
          className="btn-demo"
          onClick={handleDemo}
          disabled={loading}
        >
          <span className="btn-demo__icon">🧪</span>
          <span className="btn-demo__text">
            <strong>Accéder au Mode Démo Opérateur</strong>
            <small>Explorez l'application sans compte</small>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Login;