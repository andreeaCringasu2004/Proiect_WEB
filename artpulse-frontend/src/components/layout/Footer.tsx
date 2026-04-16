import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer-wrap">
      <div className="container footer-inner">
        <div className="footer-col">
          <span className="footer-logo">AP</span>
          <p className="footer-desc">ArtPulse — Unveiling the world's most curated fine art auctions.</p>
        </div>
        <div className="footer-col">
          <h4 className="footer-title">Explore</h4>
          <Link to="/auctions" className="footer-link">Live Auctions</Link>
          <Link to="/" className="footer-link">Past Highlights</Link>
        </div>
        <div className="footer-col">
          <h4 className="footer-title">Legal</h4>
          <Link to="/legal" className="footer-link">Terms & Conditions</Link>
          <Link to="/legal" className="footer-link">Privacy Policy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span className="footer-copy">© {new Date().getFullYear()} ArtPulse. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;