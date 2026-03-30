import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  user?: { name: string; role: string } | null;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const roleLabel: Record<string, string> = {
    guest: 'Guest',
    bidder: 'Bidder',
    seller: 'Seller',
    expert: 'Expert',
    admin: 'Admin',
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">AP</span>
          <span className="navbar__logo-text">ArtPulse</span>
        </Link>

        {/* Desktop nav */}
        <ul className="navbar__links">
          <li><Link to="/auctions" className={`navbar__link ${isActive('/auctions') ? 'navbar__link--active' : ''}`}>Auctions</Link></li>
          <li><Link to="/categories" className={`navbar__link ${isActive('/categories') ? 'navbar__link--active' : ''}`}>Categories</Link></li>
          <li><Link to="/info" className={`navbar__link ${isActive('/info') ? 'navbar__link--active' : ''}`}>Info</Link></li>
          {user?.role === 'seller' && (
            <li><Link to="/seller/dashboard" className={`navbar__link ${isActive('/seller/dashboard') ? 'navbar__link--active' : ''}`}>My Listings</Link></li>
          )}
          {user?.role === 'expert' && (
            <li><Link to="/expert/review" className={`navbar__link ${isActive('/expert/review') ? 'navbar__link--active' : ''}`}>Review</Link></li>
          )}
          {user?.role === 'admin' && (
            <li><Link to="/admin" className={`navbar__link ${isActive('/admin') ? 'navbar__link--active' : ''}`}>Admin</Link></li>
          )}
        </ul>

        {/* Auth area */}
        <div className="navbar__auth">
          {user ? (
            <div className="navbar__user">
              <span className="navbar__role-badge">{roleLabel[user.role] ?? user.role}</span>
              <span className="navbar__user-name">{user.name}</span>
              <button className="navbar__logout" onClick={onLogout}>Sign out</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">Sign in</Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">Register</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}>
        <Link to="/auctions" className="navbar__drawer-link">Auctions</Link>
        <Link to="/categories" className="navbar__drawer-link">Categories</Link>
        <Link to="/info" className="navbar__drawer-link">Info</Link>
        {user?.role === 'seller' && <Link to="/seller/dashboard" className="navbar__drawer-link">My Listings</Link>}
        {user?.role === 'expert' && <Link to="/expert/review" className="navbar__drawer-link">Review</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="navbar__drawer-link">Admin</Link>}
        <div className="navbar__drawer-divider" />
        {user ? (
          <button className="navbar__drawer-link navbar__drawer-link--danger" onClick={onLogout}>Sign out</button>
        ) : (
          <>
            <Link to="/login" className="navbar__drawer-link">Sign in</Link>
            <Link to="/register" className="navbar__drawer-link navbar__drawer-link--accent">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;