import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionPage from './pages/AuctionPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import InfoPage from './pages/InfoPage';
import AdminPage from './pages/AdminPage';
import EditProfilePage from './pages/EditProfilePage';

import './styles/globals.css';

/* ── Protected route wrapper ── */
interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}
const Protected: React.FC<ProtectedProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/* ── Placeholder for pages not yet built ── */
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, paddingTop: 'var(--nav-h)' }}>
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)' }}>{title}</h1>
    <p style={{ color: 'var(--ink-muted)' }}>Coming soon — this page is being built.</p>
  </div>
);

/* ── Inner app ── */
const AppInner: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loading">Încărcare sesiune...</div>;
  }

  return (
    <>
      <Navbar user={user} onLogout={logout} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage onLogin={login} />} />

        {/* Marketplace */}
        <Route path="/auctions" element={<AuctionPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />

        {/* Info / About / Contact */}
        <Route path="/info" element={<InfoPage />} />

        {/* Authenticated */}
        <Route path="/profile/edit" element={
          <Protected>
            <EditProfilePage />
          </Protected>
        } />
        <Route path="/watchlist" element={
          <Protected allowedRoles={['bidder', 'seller', 'expert', 'admin']}>
            <PlaceholderPage title="My Watchlist" />
          </Protected>
        } />

        {/* Seller */}
        <Route path="/seller/dashboard" element={
          <Protected allowedRoles={['seller', 'admin']}>
            <PlaceholderPage title="Seller Dashboard" />
          </Protected>
        } />
        <Route path="/seller/products/new" element={
          <Protected allowedRoles={['seller', 'admin']}>
            <PlaceholderPage title="Add Product" />
          </Protected>
        } />

        {/* Expert */}
        <Route path="/expert/review" element={
          <Protected allowedRoles={['expert', 'admin']}>
            <PlaceholderPage title="Expert Review" />
          </Protected>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <Protected allowedRoles={['admin']}>
            <AdminPage />
          </Protected>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </>
  );
};

/* ── Root ── */
const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </BrowserRouter>
);

export default App;