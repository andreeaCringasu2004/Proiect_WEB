import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import PaymentModal from '../components/PaymentModal';
import './AuctionDetailPage.css';

const useCountdown = (target: Date) => {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, expired: true };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      expired: false,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
};

const DEFAULT_ID = 1;

interface GalleryProps { images: string[] }
const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + images.length) % images.length);
  }, [images.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 4000);
  }, [images.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleManual = (idx: number) => {
    goTo(idx);
    resetTimer();
  };

  return (
    <div className="ad-gallery">
      <div className="ad-gallery__main">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`View ${i + 1}`}
            className={`ad-gallery__img ${i === current ? 'ad-gallery__img--active' : ''}`}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}

        <button className="ad-gallery__arrow ad-gallery__arrow--prev"
          onClick={() => handleManual(current - 1)} aria-label="Previous">&#8592;</button>
        <button className="ad-gallery__arrow ad-gallery__arrow--next"
          onClick={() => handleManual(current + 1)} aria-label="Next">&#8594;</button>

        <div className="ad-gallery__dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`ad-gallery__dot ${i === current ? 'ad-gallery__dot--active' : ''}`}
              onClick={() => handleManual(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        <div className="ad-gallery__counter">
          {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>

        <div className="ad-gallery__progress-wrap">
          <div className="ad-gallery__progress" key={current} />
        </div>
      </div>

      <div className="ad-gallery__thumbs">
        {images.map((src, i) => (
          <button
            key={src}
            className={`ad-gallery__thumb ${i === current ? 'ad-gallery__thumb--active' : ''}`}
            onClick={() => handleManual(i)}
            aria-label={`Thumbnail ${i + 1}`}
          >
            <img src={src} alt={`Thumb ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
};


const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { auctions, bids, placeBid, products, purchasedIds, markAsPurchased } = useData();
  const navigate = useNavigate();

  const numId = Number(id) || DEFAULT_ID;
  let auction = auctions.find(a => a.id === numId);

  if (!auction) {
    const dbProd = products.find(p => p.id === numId);
    if (dbProd) {
      auction = {
        id: dbProd.id, title: dbProd.title, artist: 'Internal Submittal', category: 'Pending',
        currentBid: dbProd.suggestedPrice || 1000, endsAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'active', bidsCount: 0, image: dbProd.images[0], startingBid: 500, description: '', year: 2023, medium: '', dimensions: '', condition: ''
      };
    } else {
      auction = auctions[0];
    }
  }

  const product = products.find(p => p.id === auction?.productId || p.title === auction?.title);
  const galleryImages = product && product.images.length > 0 ? product.images : [auction!.image];
  const auctionBids = bids.filter(b => b.auctionId === auction!.id);
  const lastBid = auctionBids[0];
  const isPurchased = purchasedIds.includes(numId);
  const userIsWinner = auction.status === 'sold' &&
    (auction.winnerName === user?.name || (lastBid?.bidder === user?.name && !auction.winnerName));

  const [bidInput, setBidInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const endsAtDate = new Date(auction!.endsAt);
  const countdown = useCountdown(endsAtDate);
  const urgent = !countdown.expired && countdown.h === 0 && countdown.m < 15;

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handlePlaceBid = () => {
    if (!user) { navigate('/login'); return; }
    const val = parseInt(bidInput);
    if (!val || val < (auction!.currentBid + 100)) {
      showToast(`Bid must be at least €${(auction!.currentBid + 100).toLocaleString()}`);
      return;
    }
    placeBid(auction!.id, user.name, val);
    setBidInput('');
    showToast(`✓ Bid of €${val.toLocaleString()} placed successfully!`);
  };

  const handleQuickBid = (amount: number) => {
    if (!user) { showToast('Sign in to place a bid.'); return; }
    setBidInput(String(amount));
  };

  const related = auctions.filter(a => a.id !== auction!.id).slice(0, 3);

  return (
    <main className="ad-page">
      <nav className="ad-breadcrumb container" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="ad-breadcrumb__sep">›</span>
        <Link to="/auctions">Auctions</Link>
        <span className="ad-breadcrumb__sep">›</span>
        <span>{auction.title}</span>
      </nav>

      <div className="ad-grid container">
        <div className="ad-left">
          <Gallery images={galleryImages} />
          <section className="ad-desc">
            <h3 className="ad-desc__heading">About This Work</h3>
            {auction!.description?.split('\n\n').map((para, i) => (
              <p key={i} className="ad-desc__para">{para}</p>
            ))}
            <div className="ad-desc__divider"><span>Provenance &amp; Details</span></div>
            <div className="ad-details-grid">
              {auction && [
                ['Artist', auction.artist],
                ['Year', String(auction.year)],
                ['Medium', auction.medium],
                ['Dimensions', auction.dimensions],
                ['Condition', auction.condition],
              ].map(([label, value]) => (
                <div key={label} className="ad-detail">
                  <span className="ad-detail__label">{label}</span>
                  <span className="ad-detail__value">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="ad-right">
          <div className="ad-panel">
            <span className="ad-panel__artist">{auction.artist}</span>
            <h1 className="ad-panel__title">{auction.title}</h1>
            <p className="ad-panel__meta">{auction.category} · {auction.year} · {auction.dimensions}</p>

            {auction.status === 'active' && (
              <div className={`ad-countdown ${urgent ? 'ad-countdown--urgent' : ''}`}>
                <div className="ad-countdown__label">
                  {countdown.expired ? 'Auction ended' : 'Time remaining'}
                </div>
                {!countdown.expired && (
                  <div className="ad-countdown__digits">
                    <div className="ad-cd-unit"><span className="ad-cd-num">{String(countdown.h).padStart(2, '0')}</span><span className="ad-cd-lbl">hrs</span></div>
                    <span className="ad-cd-sep">:</span>
                    <div className="ad-cd-unit"><span className="ad-cd-num">{String(countdown.m).padStart(2, '0')}</span><span className="ad-cd-min">min</span></div>
                    <span className="ad-cd-sep">:</span>
                    <div className="ad-cd-unit"><span className="ad-cd-num">{String(countdown.s).padStart(2, '0')}</span><span className="ad-cd-sec">sec</span></div>
                  </div>
                )}
              </div>
            )}

            <div className="ad-prices">
              <div className="ad-price-block">
                <span className="ad-price-label">Starting Price</span>
                <span className="ad-price-val">€{auction.startingBid?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="ad-price-block">
                <span className="ad-price-label">{auction.status === 'sold' ? 'Winning Bid' : 'Current Bid'}</span>
                <span className="ad-price-val ad-price-val--current">€{auction.currentBid.toLocaleString()}</span>
              </div>
            </div>

            {auction.status === 'sold' && (
              <div className="ad-winner-badge" style={{ background: 'var(--sage)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <span style={{ fontSize: '20px' }}>🏆</span>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auction Won By</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{auction.winnerName || lastBid?.bidder || 'Unknown'}</div>
                </div>
              </div>
            )}

            <div className="ad-meta-row">
              {auction.year && <div className="ad-meta-item">Year: <strong>{auction.year}</strong></div>}
              {auction.medium && <div className="ad-meta-item">Medium: <strong>{auction.medium}</strong></div>}
            </div>
            <div className="ad-meta-row">
              {auction.dimensions && <div className="ad-meta-item">Size: <strong>{auction.dimensions}</strong></div>}
              {auction.condition && <div className="ad-meta-item">Condition: <strong>{auction.condition}</strong></div>}
            </div>

            {!user && (
              <div className="ad-guest-notice">
                🔒 <Link to="/login">Sign in</Link> or <Link to="/register">register</Link> to place a bid.
              </div>
            )}

            {auction.status === 'active' && !countdown.expired && (
              <div className="ad-quick-bids">
                {[auction.currentBid + 100, auction.currentBid + 500, auction.currentBid + 1000].map(amt => (
                  <button key={amt} className="ad-quick-bid" onClick={() => handleQuickBid(amt)}>€{amt.toLocaleString()}</button>
                ))}
              </div>
            )}

            {auction.status === 'active' && (
              <div className="ad-actions">
                <div className="ad-input-group">
                  <span className="ad-currency">€</span>
                  <input
                    type="number"
                    className="ad-bid-input"
                    placeholder={`Min €${(auction.currentBid + 100).toLocaleString()}`}
                    value={bidInput}
                    onChange={e => setBidInput(e.target.value)}
                  />
                </div>
                <button
                  className="ad-action-btn ad-action-btn--primary"
                  onClick={handlePlaceBid}
                  disabled={!bidInput || Number(bidInput) <= auction.currentBid}
                >
                  Place Bid
                </button>
              </div>
            )}

            {auction.status === 'sold' && userIsWinner && (
              <div className="ad-actions">
                {isPurchased ? (
                  <div className="ad-purchased-badge" style={{ width: '100%', textAlign: 'center', background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontWeight: 600, border: '1px solid #c8e6c9' }}>
                    Purchased ✓
                  </div>
                ) : (
                  <button
                    className="ad-action-btn ad-action-btn--primary"
                    onClick={() => setShowPayment(true)}
                    style={{ width: '100%', background: 'var(--sage)' }}
                  >
                    Pay & Finalize Purchase
                  </button>
                )}
              </div>
            )}

            <button
              className={`ad-watchlist-btn ${watchlisted ? 'ad-watchlist-btn--active' : ''}`}
              onClick={() => {
                if (!user) { showToast('Sign in to use your watchlist.'); return; }
                setWatchlisted(w => !w);
                showToast(watchlisted ? 'Removed from watchlist' : '♥ Added to watchlist');
              }}
            >
              {watchlisted ? '♥  In Watchlist' : '♡  Add to Watchlist'}
            </button>

            <div className="ad-history">
              <button className={`ad-history__toggle ${historyOpen ? 'ad-history__toggle--open' : ''}`} onClick={() => setHistoryOpen(o => !o)}>
                <span>Bid History <span className="ad-history__count">({auctionBids.length} bids)</span></span>
                <span className="ad-history__arrow">▾</span>
              </button>
              {historyOpen && (
                <div className="ad-history__list">
                  {auctionBids.map((entry, i) => (
                    <div key={i} className="ad-history__entry">
                      <span className="ad-history__bidder">{entry.bidder.split(' ')[0]} ***</span>
                      <span className="ad-history__amount">€{entry.amount.toLocaleString()}</span>
                      <span className="ad-history__time">{entry.time}</span>
                    </div>
                  ))}
                  {auctionBids.length === 0 && <p className="ad-history__empty">No bids yet.</p>}
                </div>
              )}
            </div>

            {userIsWinner && !isPurchased && (
              <div className="ad-winner-box animate-fade-up">
                <h3>🎉 You won!</h3>
                <p>Confirm your purchase of <strong>{auction.title}</strong> for <strong>€{auction.currentBid.toLocaleString()}</strong>.</p>
                <button className="ad-pay-btn" onClick={() => setShowPayment(true)}>
                  Secure Checkout →
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {showPayment && (
        <PaymentModal
          amount={auction.currentBid}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            markAsPurchased(numId);
            setShowPayment(false);
            showToast('✓ Payment successful! Your artwork is being prepared.');
          }}
        />
      )}

      {related.length > 0 && (
        <section className="ad-related container">
          <div className="ad-related__head">
            <h2 className="ad-related__title">Related Auctions</h2>
            <Link to="/auctions" className="ad-related__see-all">View all →</Link>
          </div>
          <div className="ad-related__grid">
            {related.map(a => (
              <article key={a.id} className="auction-card">
                <div className="auction-card__img-wrap">
                  <img src={a.image} alt={a.title} className="auction-card__img" loading="lazy" />
                  <span className={`auction-card__status auction-card__status--${a.status}`}>
                    {a.status === 'active' ? '● Live' : a.status === 'sold' ? '● Sold' : '◯ Upcoming'}
                  </span>
                </div>
                <div className="auction-card__body">
                  <p className="auction-card__artist">{a.artist}</p>
                  <h3 className="auction-card__title">{a.title}</h3>
                  <div className="auction-card__footer">
                    <span className="auction-card__bid">€{a.currentBid.toLocaleString()}</span>
                    <Link to={`/auctions/${a.id}`} className="auction-card__btn">Details →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default AuctionDetailPage;