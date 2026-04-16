import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatWidget from './components/ChatWidget';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionPage from './pages/AuctionPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import InfoPage from './pages/InfoPage';
import WatchlistPage from './pages/WatchlistPage';
import SellerDashboard from './pages/SellerDashboard';
import ExpertPage from './pages/ExpertPage';
import AdminPage from './pages/AdminPage';
import EditProfilePage from './pages/EditProfilePage';
import TermsPage from './pages/TermsPage';
import PurchasesPage from './pages/PurchasesPage';

import './styles/globals.css';

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


const ChatWidgetController: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hiddenPaths = ['/login', '/register', '/admin'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;
  if (!user || !['bidder', 'seller', 'expert'].includes(user.role)) return null;
  return <ChatWidget />;
};


const AppInner: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  if (isLoading) return <div className="page-loading">Încărcare sesiune...</div>;

  return (
    <>
      <Navbar user={user} onLogout={logout} />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage onLogin={login} />} />

        {/* ── Marketplace (public — Unknown products hidden by AuctionPage logic) ── */}
        <Route path="/auctions" element={<AuctionPage />} />
        <Route path="/auctions/:id" element={<AuctionDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />

        {/* ── Info / Contact (public) ── */}
        <Route path="/info" element={<InfoPage />} />
        <Route path="/legal" element={<TermsPage />} />

        {/* ── Authenticated: any logged-in user ── */}
        <Route path="/profile/edit" element={
          <Protected>
            <EditProfilePage />
          </Protected>
        } />

        {/* ── Bidder: watchlist & purchases ── */}
        <Route path="/watchlist" element={
          <Protected allowedRoles={['bidder', 'seller', 'expert', 'admin']}>
            <WatchlistPage />
          </Protected>
        } />
        <Route path="/purchases" element={
          <Protected allowedRoles={['bidder']}>
            <PurchasesPage />
          </Protected>
        } />

        {/* ── Seller dashboard ── */}
        <Route path="/seller/dashboard" element={
          <Protected allowedRoles={['seller', 'admin']}>
            <SellerDashboard />
          </Protected>
        } />

        {/* ── Expert review ── */}
        <Route path="/expert/review" element={
          <Protected allowedRoles={['expert', 'admin']}>
            <ExpertPage />
          </Protected>
        } />

        {/* ── Admin panel ── */}
        <Route path="/admin" element={
          <Protected allowedRoles={['admin']}>
            <AdminPage />
          </Protected>
        } />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Chat widget — shown only for bidder / seller / expert */}
      <ChatWidgetController />

      <Footer />
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <DataProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </DataProvider>
  </BrowserRouter>
);

export default App;