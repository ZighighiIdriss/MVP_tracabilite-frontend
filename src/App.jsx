// =============================================================================
// App.jsx — Routage applicatif
// =============================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/ui/PrivateRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateProduct from './pages/CreateProduct';
import ProductDetail from './pages/ProductDetail';
import AddStep from './pages/AddStep';
import ProductTimelineManager from './pages/ProductTimelineManager';
import EditProduct from './pages/EditProduct';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Route publique ──────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Routes protégées (avec Layout global) ────────────────── */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products/new" element={<CreateProduct />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/timeline" element={<ProductTimelineManager />} />
              <Route path="/products/:id/steps/new" element={<AddStep />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
            </Route>
          </Route>

          {/* ── Fallback → Dashboard ────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
