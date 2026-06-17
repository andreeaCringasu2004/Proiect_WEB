import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { favoriteService } from '../services/favoriteService';
import PaymentModal from '../components/PaymentModal';
import './WatchlistPage.css';


interface WatchlistItem {
  id: number;
  title: string;
  artist: string;
  category: string;
  currentBid: number;
  startingBid: number;
  status: 'upcoming' | 'active' | 'ended';
  isWon?: boolean;
  endsAt: Date;          // real Date for countdown logic
  img: string;
  isWatched: boolean;
  notified10: boolean;   // T-10 min notification sent
  notified5: boolean;    // T-5  min notification sent
  notifiedStart: boolean;// auction-start notification sent
}


interface SessionToast {
  id: number;
  type: 'start' | 'warning' | 'urgent' | 'info';
  message: string;
  sub: string;
  auctionId?: number;
}

const useCountdown = (target: Date | string) => {
  const [t, setT] = useState(() => {
    const targetDate = typeof target === 'string' ? new Date(target) : target;
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, totalMs: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      totalMs: diff,
    };
  });

  useEffect(() => {
    const targetDate = typeof target === 'string' ? new Date(target) : target;
    const id = setInterval(() => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setT({ h: 0, m: 0, s: 0, totalMs: 0 });
      } else {
        setT({
          h: Math.floor(diff / 3_600_000),
          m: Math.floor((diff % 3_600_000) / 60_000),
          s: Math.floor((diff % 60_000) / 1_000),
          totalMs: diff,
        });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  return t;
};




interface WatchCardProps {
  item: WatchlistItem;
  onToggle: (id: number) => void;
  onPay?: (item: WatchlistItem) => void;
}
const WatchCard: React.FC<WatchCardProps> = ({ item, onToggle, onPay }) => {
  const cd = useCountdown(item.endsAt);
  const urgent = item.status === 'active' && cd.totalMs > 0 && cd.totalMs < 10 * 60_000;
  const veryUrgent = item.status === 'active' && cd.totalMs > 0 && cd.totalMs < 5 * 60_000;

  return (
    <article className="wl-card">
      <div className="wl-card__img-wrap">
        <img src={item.img} alt={item.title} className="wl-card__img" loading="lazy" />

        {/* Status badge */}
        <span className={`wl-card__status wl-card__status--${(item.status === 'active' && cd.totalMs <= 0) ? 'ended' : item.status}`}>
          {(item.status === 'active' && cd.totalMs > 0) ? '● Live' : (item.status === 'active' && cd.totalMs <= 0) ? '✓ Ended' : item.status === 'upcoming' ? '◯ Soon' : '✓ Ended'}
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
          {item.status === 'ended' && item.isWon && onPay && (
            <button className="wl-card__bid-btn" onClick={() => onPay(item)} style={{ background: 'var(--sage)' }}>Pay Now →</button>
          )}
        </div>
      </div>
    </article>
  );
};


const SessionToastStack: React.FC<{ toasts: SessionToast[]; onDismiss: (id: number) => void; onClickToast: (auctionId?: number) => void }> = ({ toasts, onDismiss, onClickToast }) => (
  <div className="session-toasts" aria-live="assertive">
    {toasts.map(t => (
      <div key={t.id} className={`session-toast session-toast--${t.type}`} onClick={() => t.auctionId && onClickToast(t.auctionId)} style={{ cursor: t.auctionId ? 'pointer' : 'default' }}>
        <div className="session-toast__icon">
          {t.type === 'start' ? '🎯' : t.type === 'warning' ? '⚠' : t.type === 'urgent' ? '🔴' : 'ℹ'}
        </div>
        <div className="session-toast__body">
          <div className="session-toast__msg">{t.message}</div>
          <div className="session-toast__sub">{t.sub}</div>
        </div>
        <button className="session-toast__close" onClick={(e) => { e.stopPropagation(); onDismiss(t.id); }}>✕</button>
      </div>
    ))}
  </div>
);


let toastSeq = 1;

const WatchlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { auctions, bids } = useData();
  const [searchParams] = useSearchParams();

  const filterParam = searchParams.get('filter');
  const initialFilter = filterParam && ['all', 'active', 'upcoming', 'ended', 'my-bids'].includes(filterParam)
    ? (filterParam as any)
    : 'all';

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [sessionToasts, setSessionToasts] = useState<SessionToast[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended' | 'my-bids'>(initialFilter);
  const [actionToast, setActionToast] = useState('');
  const [actionVisible, setActionVisible] = useState(false);

  const [payItem, setPayItem] = useState<WatchlistItem | null>(null);

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
            auctionId: item.id,
          });
          updated.notified10 = true;
        }

        // T-5 notification
        if (!item.notified5 && diff <= 5 * 60_000) {
          addSessionToast({
            type: 'urgent',
            message: `🔴 5 minutes left — ${item.title}`,
            sub: `Final price so far: €${item.currentBid.toLocaleString()} — bid now!`,
            auctionId: item.id,
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
    if (upcomingWatched.length === 0) return;

    const timer = setTimeout(() => {
      upcomingWatched.forEach(item => {
        addSessionToast({
          type: 'start',
          message: `🎯 Auction started — ${item.title}`,
          sub: 'A product you are watching has gone live. Starting bid: €' + item.startingBid.toLocaleString(),
          auctionId: item.id,
        });
      });
      // Mark as notified so it doesn't trigger again
      setItems(prev => prev.map(i =>
        upcomingWatched.some(uw => uw.id === i.id) ? { ...i, notifiedStart: true } : i
      ));
    }, 4000); // simulate start after 4s for demo

    return () => clearTimeout(timer);
  }, [addSessionToast, items]);

  // Load favorites from backend and map auctions to items
  useEffect(() => {
    if (!user) return;
    favoriteService.getFavorites().then(favIds => {
      const initialItems: WatchlistItem[] = auctions.map(a => {
        const isWatched = favIds.includes(a.productId || -1);
        return {
          id: a.id,
          title: a.title,
          artist: a.artist,
          category: a.category,
          currentBid: a.currentBid,
          startingBid: a.startingBid,
          status: a.status === 'sold' ? 'ended' : a.status,
          endsAt: new Date(a.endsAt),
          img: a.image,
          isWatched,
          notified10: false,
          notified5: false,
          notifiedStart: false
        };
      });
      setItems(initialItems);
    }).catch(err => {
      console.warn('Failed to load favorites:', err);
      const fallback = auctions.map(a => ({
        id: a.id,
        title: a.title,
        artist: a.artist,
        category: a.category,
        currentBid: a.currentBid,
        startingBid: a.startingBid,
        status: a.status === 'sold' ? ('ended' as const) : a.status,
        endsAt: new Date(a.endsAt),
        img: a.image,
        isWatched: false,
        notified10: false,
        notified5: false,
        notifiedStart: false
      }));
      setItems(fallback);
    });
  }, [auctions, user]);

  if (!user || !['bidder', 'seller', 'expert', 'admin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  const toggleWatch = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const next = !item.isWatched;
    const auction = auctions.find(a => a.id === id);
    const prodId = auction?.productId;

    if (prodId) {
      const promise = next
        ? favoriteService.addFavorite(prodId)
        : favoriteService.removeFavorite(prodId);

      promise.then(() => {
        showAction(next ? '♥ Added to watchlist' : 'Removed from watchlist');
      }).catch(err => {
        console.warn('Failed to update favorite:', err);
      });
    }

    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, isWatched: next };
    }));
  };

  const dismissToast = (id: number) => {
    setSessionToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleToastClick = (auctionId?: number) => {
    if (auctionId) navigate('/auctions/' + auctionId);
  };

  const watched = items.filter(i => i.isWatched);
  const displayed = filter === 'my-bids'
    ? items.filter(i => bids.some(b => b.auctionId === i.id && (b.bidderId === user.id || b.bidder === user.name)))
    : (filter === 'all' ? watched : watched.filter(i => i.status === filter));

  return (
    <main className="wl-page">
      {/* Session toasts stack */}
      <SessionToastStack toasts={sessionToasts} onDismiss={dismissToast} onClickToast={handleToastClick} />

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
          {(['all', 'active', 'upcoming', 'ended', 'my-bids'] as const).map(f => (
            <button
              key={f}
              className={`wl-filter-pill ${filter === f ? 'wl-filter-pill--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'active' ? '● Live' : f === 'upcoming' ? 'Upcoming' : f === 'ended' ? 'Ended' : 'My Bids'}
              {f !== 'all' && (
                <span className="wl-filter-pill__count">
                  {f === 'my-bids'
                    ? auctions.filter(a => bids.some(b => b.auctionId === a.id && (b.bidderId === user.id || b.bidder === user.name))).length
                    : watched.filter(i => i.status === f).length}
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
              <WatchCard key={item.id} item={item} onToggle={toggleWatch} onPay={setPayItem} />
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

      {/* Payment Modal */}
      {payItem && (
        <PaymentModal
          amount={payItem.currentBid}
          itemName={payItem.title}
          onClose={() => setPayItem(null)}
          onSuccess={() => {
            setItems(prev => prev.map(i => i.id === payItem.id ? { ...i, isWon: false, status: 'ended' } : i));
            setPayItem(null);
            showAction('✨ Payment successful! Status updated.');
          }}
        />
      )}
    </main>
  );
};

export default WatchlistPage;