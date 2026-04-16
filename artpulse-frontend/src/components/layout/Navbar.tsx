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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [zoom, setZoom] = useState(localStorage.getItem('zoom') || 'normal');
  const location = useLocation();


  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-zoom', zoom);
    localStorage.setItem('zoom', zoom);
  }, [zoom]);

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
          {user?.role === 'bidder' && (
            <li><Link to="/purchases" className={`navbar__link ${isActive('/purchases') ? 'navbar__link--active' : ''}`}>My Purchases</Link></li>
          )}
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

        {/* Auth & Settings area */}
        <div className="navbar__auth">
          {/* Settings Dropdown */}
          <div className="navbar__settings">
            <button
              className="navbar__btn navbar__btn--ghost navbar__settings-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Settings"
            >
              ⚙️
            </button>
            {settingsOpen && (
              <div className="navbar__settings-dropdown">
                <div className="navbar__settings-group">
                  <div className="navbar__settings-label">Theme</div>
                  <div className="navbar__settings-options">
                    <button className={`navbar__settings-opt ${theme === 'light' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setTheme('light')}>Light</button>
                    <button className={`navbar__settings-opt ${theme === 'dark' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
                  </div>
                </div>
                <div className="navbar__settings-group">
                  <div className="navbar__settings-label">Format Size</div>
                  <div className="navbar__settings-options">
                    <button className={`navbar__settings-opt ${zoom === 'out' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('out')}>A-</button>
                    <button className={`navbar__settings-opt ${zoom === 'normal' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('normal')}>A</button>
                    <button className={`navbar__settings-opt ${zoom === 'in' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('in')}>A+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
        {/* user info block*/}
        {user && (
          <div className="navbar__drawer-user">
            <div className="navbar__drawer-user__left">
              <span className="navbar__drawer-user__avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <div className="navbar__drawer-user__name">{user.name}</div>
                <div className="navbar__drawer-user__role">
                  {roleLabel[user.role] ?? user.role}
                </div>
              </div>
            </div>
          </div>
        )}
        <Link to="/categories" className="navbar__drawer-link">Categories</Link>
        <Link to="/info" className="navbar__drawer-link">Info</Link>
        {user?.role === 'bidder' && <Link to="/purchases" className="navbar__drawer-link">My Purchases</Link>}
        {user?.role === 'seller' && <Link to="/seller/dashboard" className="navbar__drawer-link">My Listings</Link>}
        {user?.role === 'expert' && <Link to="/expert/review" className="navbar__drawer-link">Review</Link>}
        {user?.role === 'admin' && <Link to="/admin" className="navbar__drawer-link">Admin</Link>}
        <div className="navbar__drawer-divider" />
        {user ? (
          <>
            <Link to="/profile/edit" className="navbar__drawer-link">Edit Profile</Link>
            <button
              className="navbar__drawer-link navbar__drawer-link--danger"
              onClick={onLogout}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__drawer-link">Sign in</Link>
            <Link to="/register" className="navbar__drawer-link navbar__drawer-link--accent">Register</Link>
          </>
        )}

        <div className="navbar__drawer-divider" />
        <div className="navbar__drawer-settings">
          <div className="navbar__settings-group">
            <div className="navbar__settings-label">Theme</div>
            <div className="navbar__settings-options">
              <button className={`navbar__settings-opt ${theme === 'light' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setTheme('light')}>Light</button>
              <button className={`navbar__settings-opt ${theme === 'dark' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
            </div>
          </div>
          <div className="navbar__settings-group" style={{ marginTop: '12px' }}>
            <div className="navbar__settings-label">Format Size</div>
            <div className="navbar__settings-options">
              <button className={`navbar__settings-opt ${zoom === 'out' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('out')}>A-</button>
              <button className={`navbar__settings-opt ${zoom === 'normal' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('normal')}>A</button>
              <button className={`navbar__settings-opt ${zoom === 'in' ? 'navbar__settings-opt--active' : ''}`} onClick={() => setZoom('in')}>A+</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;