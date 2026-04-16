import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './WatchlistPage.css';

const PurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const { auctions, purchasedIds } = useData();

  if (!user || user.role !== 'bidder') {
    return <Navigate to="/" replace />;
  }

  const myPurchases = auctions.filter(a => purchasedIds.includes(a.id));

  return (
    <main className="wl-page">
      <section className="wl-header">
        <div className="container">
          <span className="wl-header__eyebrow">My Account</span>
          <h1 className="wl-header__title">My Purchases</h1>
          <p className="wl-header__sub">
            {myPurchases.length} {myPurchases.length === 1 ? 'artwork' : 'artworks'} in your collection
          </p>
        </div>
      </section>

      <div className="container wl-grid-wrap" style={{ marginTop: '40px' }}>
        {myPurchases.length > 0 ? (
          <div className="wl-grid">
            {myPurchases.map(item => (
              <article key={item.id} className="wl-card">
                <div className="wl-card__img-wrap">
                  <img src={item.image} alt={item.title} className="wl-card__img" loading="lazy" />
                  <span className="wl-card__status wl-card__status--ended">✓ Purchased</span>
                  <span className="wl-card__cat">{item.category}</span>
                </div>
                <div className="wl-card__body">
                  <p className="wl-card__artist">{item.artist}</p>
                  <h3 className="wl-card__title">{item.title}</h3>
                  <div className="wl-card__prices">
                    <div className="wl-card__price-item">
                      <span className="wl-card__price-lbl">Paid Price</span>
                      <span className="wl-card__price-val">€{item.currentBid.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="wl-card__footer">
                    <Link to={`/auctions/${item.id}`} className="wl-card__detail-btn" style={{ width: '100%', textAlign: 'center' }}>View Receipt & Details</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="wl-empty">
            <div className="wl-empty__icon">🛍️</div>
            <h3>No purchases yet</h3>
            <p>Once you win an auction and complete the payment, your artworks will appear here.</p>
            <Link to="/auctions" className="wl-empty__btn">Browse Auctions →</Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default PurchasesPage;
