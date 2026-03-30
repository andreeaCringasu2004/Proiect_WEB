import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const goToInfo = (tab: string) => {
    navigate(`/info?tab=${tab}`);
  };

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <span className="footer__logo-mark">AP</span>
            <span className="footer__logo-text">ArtPulse</span>
          </Link>
          <p className="footer__tagline">
            Where art finds its true value.<br />
            Fine art auctions for discerning collectors.
          </p>
          <div className="footer__socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter/X">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h4 className="footer__col-title">Platform</h4>
            <Link to="/auctions" className="footer__col-link">Live Auctions</Link>
            <Link to="/categories" className="footer__col-link">Categories</Link>
            <Link to="/register" className="footer__col-link">Become a Seller</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Account</h4>
            <Link to="/login" className="footer__col-link">Sign In</Link>
            <Link to="/register" className="footer__col-link">Register</Link>
            <Link to="/watchlist" className="footer__col-link">My Watchlist</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Info</h4>
            <button className="footer__col-link footer__col-link--btn" onClick={() => goToInfo('story')}>Our Story</button>
            <button className="footer__col-link footer__col-link--btn" onClick={() => goToInfo('how-it-works')}>How It Works</button>
            <button className="footer__col-link footer__col-link--btn" onClick={() => goToInfo('contact')}>Contact & Location</button>
          </div>
        </div>
      </div>

      <div className="footer__bottom container">
        <span className="footer__copy">© {new Date().getFullYear()} ArtPulse. All rights reserved.</span>
        <span className="footer__copy footer__copy--muted">Built with care for the love of art.</span>
      </div>
    </footer>
  );
};

export default Footer;