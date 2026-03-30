import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuctionDetailPage.css';

/* ── Countdown hook ── */
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

/* ── Mock auction data (keyed by id) ── */
const AUCTION_DATA: Record<number, {
  id: number; title: string; artist: string; category: string;
  medium: string; year: number; dimensions: string; condition: string;
  description: string; currentBid: number; startingBid: number;
  status: 'active' | 'upcoming'; endsAt: Date; bidsCount: number; watching: number;
  images: string[];
  bidHistory: { bidder: string; amount: number; ago: string }[];
}> = {
  1: {
    id: 1, title: 'Lumière dorée', artist: 'Marie Leblanc', category: 'Painting',
    medium: 'Oil on canvas', year: 2023, dimensions: '120 × 90 cm', condition: 'Excellent — unframed',
    description: `Lumière dorée is a study in the way late-afternoon light transforms ordinary domestic space into something close to the sacred. Leblanc works in thin, layered glazes of oil, building depth through accumulated translucency rather than impasto weight. The result is a surface that seems to emit light rather than merely reflect it.\n\nPainted in her Bordeaux studio over three months in 2023, this work marks a maturation of her signature approach: strict geometric composition held in tension with the near-liquid warmth of the palette. The architectural shadow falling diagonally across the lower third acts as the painting's quiet drama — a reminder that light only reveals itself against darkness.`,
    currentBid: 4_200, startingBid: 2_000, status: 'active',
    endsAt: new Date(Date.now() + 2 * 3_600_000 + 14 * 60_000),
    bidsCount: 18, watching: 312,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=85',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=900&q=85',
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=900&q=85',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=85',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=900&q=85',
    ],
    bidHistory: [
      { bidder: 'Collector ***42', amount: 4_200, ago: '3 min ago' },
      { bidder: 'Patron ***71', amount: 3_900, ago: '12 min ago' },
      { bidder: 'Bidder ***17', amount: 3_600, ago: '29 min ago' },
      { bidder: 'Collector ***88', amount: 3_200, ago: '47 min ago' },
      { bidder: 'Patron ***05', amount: 2_800, ago: '1 hr ago' },
      { bidder: 'Bidder ***33', amount: 2_000, ago: 'Starting bid' },
    ],
  },
  2: {
    id: 2, title: 'Silent Forms', artist: 'Kenji Watanabe', category: 'Sculpture',
    medium: 'Cast bronze', year: 2022, dimensions: '42 × 28 × 35 cm', condition: 'Excellent — patinated finish',
    description: `Silent Forms is a meditation on the human figure reduced to its essential geometry. Watanabe, trained at the Tokyo University of the Arts before moving to Milan, works through a process of additive and subtractive modeling that leaves visible the decisions made and unmade.\n\nThe bronze's patination was developed in collaboration with a traditional foundry in Pietrasanta, achieving a surface that shifts between near-black and warm amber depending on ambient light — a deliberate reference to Watanabe's interest in how context shapes perception of form.`,
    currentBid: 8_750, startingBid: 4_000, status: 'active',
    endsAt: new Date(Date.now() + 5 * 3_600_000 + 33 * 60_000),
    bidsCount: 31, watching: 508,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85',
      'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=900&q=85',
      'https://images.unsplash.com/photo-1549490349-8643362247b5?w=900&q=85',
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=900&q=85',
    ],
    bidHistory: [
      { bidder: 'Collector ***09', amount: 8_750, ago: '1 min ago' },
      { bidder: 'Patron ***22', amount: 8_200, ago: '8 min ago' },
      { bidder: 'Bidder ***55', amount: 7_500, ago: '19 min ago' },
      { bidder: 'Collector ***81', amount: 6_000, ago: '38 min ago' },
      { bidder: 'Patron ***47', amount: 4_000, ago: 'Starting bid' },
    ],
  },
};

/* ── Fallback for unknown IDs ── */
const DEFAULT_ID = 1;

/* ── Gallery Component ── */
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
    }, 3000);
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
      {/* Main image */}
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

        {/* Arrows */}
        <button className="ad-gallery__arrow ad-gallery__arrow--prev"
          onClick={() => handleManual(current - 1)} aria-label="Previous">&#8592;</button>
        <button className="ad-gallery__arrow ad-gallery__arrow--next"
          onClick={() => handleManual(current + 1)} aria-label="Next">&#8594;</button>

        {/* Dot indicators */}
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

        {/* Counter */}
        <div className="ad-gallery__counter">
          {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>

        {/* Progress bar (auto-slide indicator) */}
        <div className="ad-gallery__progress-wrap">
          <div className="ad-gallery__progress" key={current} />
        </div>
      </div>

      {/* Thumbnail strip */}
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

/* ── Main AuctionDetailPage ── */
const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const numId = Number(id) || DEFAULT_ID;
  const auction = AUCTION_DATA[numId] ?? AUCTION_DATA[DEFAULT_ID];

  const countdown = useCountdown(auction.endsAt);
  const urgent = !countdown.expired && countdown.h === 0 && countdown.m < 15;

  const [currentBid, setCurrentBid] = useState(auction.currentBid);
  const [bidsCount, setBidsCount] = useState(auction.bidsCount);
  const [bidInput, setBidInput] = useState('');
  const [bidHistory, setBidHistory] = useState(auction.bidHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const minNext = currentBid + 100;

  const handleBid = () => {
    if (!user) { navigate('/login'); return; }
    const val = parseInt(bidInput);
    if (!val || val < minNext) {
      showToast(`Bid must be at least €${minNext.toLocaleString()}`);
      return;
    }
    const newEntry = { bidder: `${user.name.split(' ')[0]} ***${Math.floor(Math.random() * 90 + 10)}`, amount: val, ago: 'Just now' };
    setBidHistory(prev => [newEntry, ...prev]);
    setCurrentBid(val);
    setBidsCount(c => c + 1);
    setBidInput('');
    showToast(`✓ Bid of €${val.toLocaleString()} placed successfully!`);
  };

  const handleQuickBid = (amount: number) => {
    if (!user) { showToast('Sign in to place a bid.'); return; }
    setBidInput(String(amount));
  };

  // Related auctions (all except current)
  const related = Object.values(AUCTION_DATA).filter(a => a.id !== auction.id);

  return (
    <main className="ad-page">
      {/* Breadcrumb */}
      <nav className="ad-breadcrumb container" aria-label="breadcrumb">
        <Link to="/">Home</Link>
        <span className="ad-breadcrumb__sep">›</span>
        <Link to="/auctions">Auctions</Link>
        <span className="ad-breadcrumb__sep">›</span>
        <span>{auction.title}</span>
      </nav>

      {/* Main grid */}
      <div className="ad-grid container">

        {/* ── LEFT: Gallery + Description ── */}
        <div className="ad-left">
          <Gallery images={auction.images} />

          {/* Description */}
          <section className="ad-desc">
            <h3 className="ad-desc__heading">About This Work</h3>
            {auction.description.split('\n\n').map((para, i) => (
              <p key={i} className="ad-desc__para">{para}</p>
            ))}

            <div className="ad-desc__divider"><span>Provenance &amp; Details</span></div>

            <div className="ad-details-grid">
              {[
                ['Artist', auction.artist],
                ['Year', String(auction.year)],
                ['Medium', auction.medium],
                ['Dimensions', auction.dimensions],
                ['Condition', auction.condition],
                ['Certificate', 'Authenticity included'],
                ['Edition', 'Unique work'],
                ['Shipping', 'Worldwide · insured'],
              ].map(([label, value]) => (
                <div key={label} className="ad-detail">
                  <span className="ad-detail__label">{label}</span>
                  <span className="ad-detail__value">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT: Bid Panel ── */}
        <aside className="ad-panel">
          <div className="ad-panel__inner">
            <span className="ad-panel__artist">{auction.artist}</span>
            <h1 className="ad-panel__title">{auction.title}</h1>
            <p className="ad-panel__meta">{auction.category} · {auction.year} · {auction.dimensions}</p>

            {/* Countdown */}
            {auction.status === 'active' && (
              <div className={`ad-countdown ${urgent ? 'ad-countdown--urgent' : ''}`}>
                <div className="ad-countdown__label">
                  {countdown.expired ? 'Auction ended' : 'Time remaining'}
                </div>
                {!countdown.expired && (
                  <div className="ad-countdown__digits">
                    <div className="ad-cd-unit">
                      <span className="ad-cd-num">{String(countdown.h).padStart(2, '0')}</span>
                      <span className="ad-cd-lbl">hrs</span>
                    </div>
                    <span className="ad-cd-sep">:</span>
                    <div className="ad-cd-unit">
                      <span className="ad-cd-num">{String(countdown.m).padStart(2, '0')}</span>
                      <span className="ad-cd-lbl">min</span>
                    </div>
                    <span className="ad-cd-sep">:</span>
                    <div className="ad-cd-unit">
                      <span className="ad-cd-num">{String(countdown.s).padStart(2, '0')}</span>
                      <span className="ad-cd-lbl">sec</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {auction.status === 'upcoming' && (
              <div className="ad-countdown ad-countdown--upcoming">
                <div className="ad-countdown__label">Auction not yet started</div>
              </div>
            )}

            {/* Price row */}
            <div className="ad-prices">
              <div className="ad-price-item">
                <span className="ad-price-lbl">Starting bid</span>
                <span className="ad-price-val">€{auction.startingBid.toLocaleString()}</span>
              </div>
              <div className="ad-price-item ad-price-item--current">
                <span className="ad-price-lbl">Current bid</span>
                <span className="ad-price-val ad-price-val--current">€{currentBid.toLocaleString()}</span>
              </div>
            </div>

            {/* Bids meta */}
            <div className="ad-meta-row">
              <span className="ad-meta-item">🏷 <strong>{bidsCount}</strong> bids</span>
              <span className="ad-meta-item">👁 <strong>{auction.watching}</strong> watching</span>
            </div>

            {/* Guest notice */}
            {!user && (
              <div className="ad-guest-notice">
                🔒 <Link to="/login">Sign in</Link> or{' '}
                <Link to="/register">register</Link> to place a bid.
              </div>
            )}

            {/* Quick bids */}
            {user && auction.status === 'active' && (
              <div className="ad-quick-bids">
                {[minNext, minNext + 200, minNext + 500, minNext + 1000].map(amt => (
                  <button key={amt} className="ad-quick-bid" onClick={() => handleQuickBid(amt)}>
                    €{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            )}

            {/* Bid input + button */}
            <div className="ad-bid-form">
              <div className="ad-bid-row">
                <input
                  type="number"
                  className="ad-bid-input"
                  placeholder={`Min €${minNext.toLocaleString()}`}
                  value={bidInput}
                  onChange={e => setBidInput(e.target.value)}
                  disabled={!user || auction.status !== 'active'}
                />
                <button
                  className={`ad-bid-btn ${(!user || auction.status !== 'active') ? 'ad-bid-btn--locked' : ''}`}
                  onClick={handleBid}
                  disabled={!user || auction.status !== 'active'}
                >
                  {!user ? '🔒 Sign in to Bid' : auction.status !== 'active' ? 'Not Live Yet' : 'Place Bid →'}
                </button>
              </div>
              <p className="ad-bid-hint">
                Minimum next bid: <strong>€{minNext.toLocaleString()}</strong> · Buyer's premium: 15%
              </p>
            </div>

            {/* Watchlist */}
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

            {/* Bid History */}
            <div className="ad-history">
              <button
                className={`ad-history__toggle ${historyOpen ? 'ad-history__toggle--open' : ''}`}
                onClick={() => setHistoryOpen(o => !o)}
              >
                <span>Bid History <span className="ad-history__count">({bidsCount} bids)</span></span>
                <span className="ad-history__arrow">▾</span>
              </button>
              {historyOpen && (
                <div className="ad-history__list">
                  {bidHistory.map((entry, i) => (
                    <div key={i} className="ad-history__entry">
                      <span className="ad-history__bidder">{entry.bidder}</span>
                      <span className="ad-history__amount">€{entry.amount.toLocaleString()}</span>
                      <span className="ad-history__time">{entry.ago}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Related auctions */}
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
                  <img src={a.images[0]} alt={a.title} className="auction-card__img" loading="lazy" />
                  <span className={`auction-card__status auction-card__status--${a.status}`}>
                    {a.status === 'active' ? '● Live' : '◯ Upcoming'}
                  </span>
                  <span className="auction-card__category-tag">{a.category}</span>
                </div>
                <div className="auction-card__body">
                  <p className="auction-card__artist">{a.artist}</p>
                  <h3 className="auction-card__title">{a.title}</h3>
                  <div className="auction-card__footer">
                    <div>
                      <span className="auction-card__bid-label">Current bid</span>
                      <span className="auction-card__bid">€{a.currentBid.toLocaleString()}</span>
                    </div>
                    <Link to={`/auctions/${a.id}`} className="auction-card__btn">Details →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Toast */}
      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default AuctionDetailPage;