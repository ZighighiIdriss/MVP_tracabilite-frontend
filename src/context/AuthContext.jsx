// =============================================================================
// AuthContext.jsx — Gestion de l'authentification
// Synchronisé avec AuthController.java :
//   login  → { success, userId, email }
//   demo   → { success, userId, email, mode: "demo" }
// =============================================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, demoLogin } from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'tracabilite_user';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restauration depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Persiste le user à chaque changement
  const persist = useCallback((userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // ── Login classique ────────────────────────────────────────────────────
  const loginUser = useCallback(async (email, password) => {
    const data = await login(email, password);
    // data = { success: true, userId, email }
    const userData = {
      userId: data.userId,
      email: data.email,
      isDemo: false,
    };
    persist(userData);
    return userData;
  }, [persist]);

  // ── Login démo ─────────────────────────────────────────────────────────
  const loginAsDemo = useCallback(async () => {
    const data = await demoLogin();
    // data = { success: true, userId, email, mode: "demo" }
    const userData = {
      userId: data.userId,
      email: data.email,
      isDemo: true,
    };
    persist(userData);
    return userData;
  }, [persist]);

  // ── Logout ─────────────────────────────────────────────────────────────
  const logoutUser = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    loginUser,
    loginAsDemo,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook utilitaire
// ---------------------------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un <AuthProvider>');
  }
  return context;
}

export default AuthContext;
