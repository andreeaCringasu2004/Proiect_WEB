import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './WatchlistPage.css';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
interface WatchlistItem {
  id: number;
  title: string;
  artist: string;
  category: string;
  currentBid: number;
  startingBid: number;
  status: 'upcoming' | 'active' | 'ended';
  endsAt: Date;          // real Date for countdown logic
  img: string;
  isWatched: boolean;
  notified10: boolean;   // T-10 min notification sent
  notified5: boolean;    // T-5  min notification sent
  notifiedStart: boolean;// auction-start notification sent
}

/* ══════════════════════════════════════════════════════════
   SESSION TOAST (distinct from action toasts)
   ══════════════════════════════════════════════════════════ */
interface SessionToast {
  id: number;
  type: 'start' | 'warning' | 'urgent' | 'info';
  message: string;
  sub: string;
}

/* ══════════════════════════════════════════════════════════
   COUNTDOWN HOOK
   ══════════════════════════════════════════════════════════ */
const useCountdown = (target: Date) => {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, totalMs: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      totalMs: diff,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
};

/* ══════════════════════════════════════════════════════════
   MOCK WATCHLIST DATA
   ══════════════════════════════════════════════════════════ */
const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: 1,
    title: 'Lumière dorée',
    artist: 'Marie Leblanc',
    category: 'Painting',
    currentBid: 4_200,
    startingBid: 2_000,
    status: 'active',
    endsAt: new Date(Date.now() + 2 * 3_600_000 + 14 * 60_000),
    img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
    isWatched: true,
    notified10: false,
    notified5: false,
    notifiedStart: true,
  },
  {
    id: 2,
    title: 'Silent Forms',
    artist: 'Kenji Watanabe',
    category: 'Sculpture',
    currentBid: 8_750,
    startingBid: 4_000,
    status: 'active',
    endsAt: new Date(Date.now() + 8 * 60_000 + 30_000), // 8.5 min → will trigger T-10
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    isWatched: true,
    notified10: false,
    notified5: false,
    notifiedStart: true,
  },
  {
    id: 4,
    title: 'Golden Hour — Complete Series',
    artist: 'Ama Diallo',
    category: 'Painting',
    currentBid: 3_100,
    startingBid: 1_500,
    status: 'upcoming',
    endsAt: new Date(Date.now() + 24 * 3_600_000),
    img: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80',
    isWatched: true,
    notified10: false,
    notified5: false,
    notifiedStart: false,
  },
  {
    id: 8,
    title: 'Fragile Geometry',
    artist: 'Ines Moreau',
    category: 'Mixed Media',
    currentBid: 1_450,
    startingBid: 800,
    status: 'active',
    endsAt: new Date(Date.now() + 4 * 60_000 + 20_000), // ~4.3 min → will trigger T-5
    img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80',
    isWatched: true,
    notified10: true,  // already sent T-10
    notified5: false,
    notifiedStart: true,
  },
];

/* ══════════════════════════════════════════════════════════
   CARD COMPONENT (inline countdown + heart)
   ══════════════════════════════════════════════════════════ */
interface WatchCardProps {
  item: WatchlistItem;
  onToggle: (id: number) => void;
}
const WatchCard: React.FC<WatchCardProps> = ({ item, onToggle }) => {
  const cd = useCountdown(item.endsAt);
  const urgent = item.status === 'active' && cd.totalMs > 0 && cd.totalMs < 10 * 60_000;
  const veryUrgent = item.status === 'active' && cd.totalMs > 0 && cd.totalMs < 5 * 60_000;

  return (
    <article className="wl-card">
      <div className="wl-card__img-wrap">
        <img src={item.img} alt={item.title} className="wl-card__img" loading="lazy" />

        {/* Status badge */}
        <span className={`wl-card__status wl-card__status--${item.status}`}>
          {item.status === 'active' ? '● Live' : item.status === 'upcoming' ? '◯ Soon' : '✓ Ended'}
        </span>

        {/* Category */}
        <span className="wl-card__cat">{item.category}</span>

        {/* Heart button */}
        <button
          className={`wl-heart ${item.isWatched ? 'wl-heart--active' : ''}`}
          onClick={() => onToggle(item.id)}
          title={item.isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-label="Toggle watchlist"
        >
          {item.isWatched ? '♥' : '♡'}
        </button>

        {/* Countdown timer */}
        {item.status === 'active' && cd.totalMs > 0 && (
          <div className={`wl-card__timer ${veryUrgent ? 'wl-card__timer--urgent' : urgent ? 'wl-card__timer--warning' : ''}`}>
            {veryUrgent && <span className="wl-card__timer-dot" />}
            {String(cd.h).padStart(2, '0')}:{String(cd.m).padStart(2, '0')}:{String(cd.s).padStart(2, '0')}
          </div>
        )}
        {item.status === 'upcoming' && (
          <div className="wl-card__timer">Starts in 24h</div>
        )}
      </div>

      <div className="wl-card__body">
        <p className="wl-card__artist">{item.artist}</p>
        <h3 className="wl-card__title">{item.title}</h3>

        <div className="wl-card__prices">
          <div className="wl-card__price-item">
            <span className="wl-card__price-lbl">Starting</span>
            <span className="wl-card__price-val">€{item.startingBid.toLocaleString()}</span>
          </div>
          <div className="wl-card__price-item wl-card__price-item--current">
            <span className="wl-card__price-lbl">Current bid</span>
            <span className="wl-card__price-val wl-card__price-val--current">
              €{item.currentBid.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="wl-card__footer">
          <Link to={`/auctions/${item.id}`} className="wl-card__detail-btn">View Details</Link>
          {item.status === 'active' && (
            <Link to={`/auctions/${item.id}`} className="wl-card__bid-btn">Bid Now →</Link>
          )}
        </div>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════════
   SESSION TOAST DISPLAY
   ══════════════════════════════════════════════════════════ */
const SessionToastStack: React.FC<{ toasts: SessionToast[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
  <div className="session-toasts" aria-live="assertive">
    {toasts.map(t => (
      <div key={t.id} className={`session-toast session-toast--${t.type}`}>
        <div className="session-toast__icon">
          {t.type === 'start' ? '🎯' : t.type === 'warning' ? '⚠' : t.type === 'urgent' ? '🔴' : 'ℹ'}
        </div>
        <div className="session-toast__body">
          <div className="session-toast__msg">{t.message}</div>
          <div className="session-toast__sub">{t.sub}</div>
        </div>
        <button className="session-toast__close" onClick={() => onDismiss(t.id)}>✕</button>
      </div>
    ))}
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
let toastSeq = 1;

const WatchlistPage: React.FC = () => {
  const { user } = useAuth();

  const [items, setItems] = useState<WatchlistItem[]>(INITIAL_WATCHLIST);
  const [sessionToasts, setSessionToasts] = useState<SessionToast[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [actionToast, setActionToast] = useState('');
  const [actionVisible, setActionVisible] = useState(false);

  const showAction = (msg: string) => {
    setActionToast(msg);
    setActionVisible(true);
    setTimeout(() => setActionVisible(false), 2800);
  };

  const addSessionToast = useCallback((t: Omit<SessionToast, 'id'>) => {
    const id = toastSeq++;
    setSessionToasts(prev => [{ ...t, id }, ...prev].slice(0, 4)); // max 4 stacked
    setTimeout(() => setSessionToasts(prev => prev.filter(x => x.id !== id)), 7000);
  }, []);

  /* ── Session notification engine (runs every second) ── */
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        if (!item.isWatched || item.status !== 'active') return item;
        const diff = item.endsAt.getTime() - Date.now();
        if (diff <= 0) return item;

        let updated = { ...item };

        // T-10 notification
        if (!item.notified10 && diff <= 10 * 60_000) {
          addSessionToast({
            type: 'warning',
            message: `⚠ 10 minutes left — ${item.title}`,
            sub: `Current bid: €${item.currentBid.toLocaleString()}`,
          });
          updated.notified10 = true;
        }

        // T-5 notification
        if (!item.notified5 && diff <= 5 * 60_000) {
          addSessionToast({
            type: 'urgent',
            message: `🔴 5 minutes left — ${item.title}`,
            sub: `Final price so far: €${item.currentBid.toLocaleString()} — bid now!`,
          });
          updated.notified5 = true;
        }

        return updated;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [addSessionToast]);

  /* ── Auction-start notification (simulated on mount) ── */
  useEffect(() => {
    const upcomingWatched = items.filter(i => i.isWatched && i.status === 'upcoming' && !i.notifiedStart);
    if (upcomingWatched.length > 0) {
      setTimeout(() => {
        addSessionToast({
          type: 'start',
          message: `🎯 Auction started — ${upcomingWatched[0].title}`,
          sub: 'A product you are watching has gone live. Starting bid: €' + upcomingWatched[0].startingBid.toLocaleString(),
        });
      }, 4000); // simulate start after 4s for demo
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user || !['bidder', 'seller', 'expert', 'admin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const toggleWatch = (id: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const next = !item.isWatched;
      showAction(next ? '♥ Added to watchlist' : 'Removed from watchlist');
      return { ...item, isWatched: next };
    }));
  };

  const dismissToast = (id: number) => {
    setSessionToasts(prev => prev.filter(t => t.id !== id));
  };

  const watched = items.filter(i => i.isWatched);
  const displayed = (filter === 'all' ? watched : watched.filter(i => i.status === filter));

  return (
    <main className="wl-page">
      {/* Session toasts stack */}
      <SessionToastStack toasts={sessionToasts} onDismiss={dismissToast} />

      {/* Header */}
      <section className="wl-header">
        <div className="container">
          <span className="wl-header__eyebrow">My Account</span>
          <h1 className="wl-header__title">Watchlist</h1>
          <p className="wl-header__sub">
            {watched.length} saved {watched.length === 1 ? 'auction' : 'auctions'} ·
            {' '}{watched.filter(i => i.status === 'active').length} live now
          </p>
        </div>
      </section>

      {/* Notification info bar */}
      <div className="wl-notif-bar">
        <div className="container wl-notif-bar__inner">
          <span className="wl-notif-bar__icon">🔔</span>
          <span className="wl-notif-bar__text">
            You will receive session alerts at auction start, T-10 minutes, and T-5 minutes
            for all items in your watchlist.
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="wl-filters">
        <div className="container wl-filters__inner">
          {(['all', 'active', 'upcoming', 'ended'] as const).map(f => (
            <button
              key={f}
              className={`wl-filter-pill ${filter === f ? 'wl-filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'active' ? '● Live' : f === 'upcoming' ? 'Upcoming' : 'Ended'}
              {f !== 'all' && (
                <span className="wl-filter-pill__count">
                  {watched.filter(i => i.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container wl-grid-wrap">
        {displayed.length > 0 ? (
          <div className="wl-grid">
            {displayed.map(item => (
              <WatchCard key={item.id} item={item} onToggle={toggleWatch} />
            ))}
          </div>
        ) : (
          <div className="wl-empty">
            <div className="wl-empty__icon">♡</div>
            <h3>No auctions here yet</h3>
            <p>
              {filter === 'all'
                ? 'Browse auctions and tap the heart icon to add them to your watchlist.'
                : `No ${filter} auctions in your watchlist.`}
            </p>
            <Link to="/auctions" className="wl-empty__btn">Browse Auctions →</Link>
          </div>
        )}
      </div>

      {/* Action toast */}
      <div className={`ad-toast ${actionVisible ? 'ad-toast--visible' : ''}`}>{actionToast}</div>
    </main>
  );
};

export default WatchlistPage;