import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './AuctionPage.css';

/* ── Countdown hook ── */
const useCountdown = (target: Date) => {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
    };
  };
  const [t, setT] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
};

/* ── Date Hardcodate ── */
const ALL_AUCTIONS = [
  { id: 1, title: 'Lumière dorée', artist: 'Marie Leblanc', category: 'Painting', currentBid: 4200, status: 'active', endsAt: new Date(Date.now() + 2 * 3600000 + 14 * 60000), img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80' },
  { id: 2, title: 'Silent Forms', artist: 'Kenji Watanabe', category: 'Sculpture', currentBid: 8750, status: 'active', endsAt: new Date(Date.now() + 5 * 3600000 + 33 * 60000), img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { id: 3, title: 'Urban Abstraction', artist: 'Sofia Petrov', category: 'Photography', currentBid: 1900, status: 'active', endsAt: new Date(Date.now() + 11 * 3600000 + 5 * 60000), img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80' },
  { id: 4, title: 'Golden Hour', artist: 'Ama Diallo', category: 'Painting', currentBid: 3100, status: 'upcoming', endsAt: new Date(Date.now() + 24 * 3600000), img: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80' },
  { id: 5, title: 'Deep Waters', artist: 'Luca Romano', category: 'Photography', currentBid: 920, status: 'active', endsAt: new Date(Date.now() + 3 * 3600000 + 20 * 60000), img: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80' },
  { id: 6, title: 'Terra Nova', artist: 'Hana Sato', category: 'Sculpture', currentBid: 5500, status: 'active', endsAt: new Date(Date.now() + 7 * 3600000), img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80' },
  { id: 7, title: 'Midnight Canvas', artist: 'Arjun Mehta', category: 'Painting', currentBid: 2300, status: 'upcoming', endsAt: new Date(Date.now() + 48 * 3600000), img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80' },
  { id: 8, title: 'Fragile Geometry', artist: 'Ines Moreau', category: 'Mixed Media', currentBid: 1450, status: 'active', endsAt: new Date(Date.now() + 1 * 3600000 + 45 * 60000), img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80' },
  { id: 9, title: 'Echoes of Blue', artist: 'Theo Andersen', category: 'Painting', currentBid: 6800, status: 'active', endsAt: new Date(Date.now() + 9 * 3600000), img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
];

const CATEGORIES = ['All', 'Painting', 'Sculpture', 'Photography', 'Mixed Media'];
const SORT_OPTIONS = [
  { value: 'ending-soon', label: 'Ending soon' },
  { value: 'highest-bid', label: 'Highest bid' },
  { value: 'lowest-bid', label: 'Lowest bid' },
  { value: 'newest', label: 'Newest' },
];

const ITEMS_PER_PAGE = 6;

/* ── Auction card ── */
const AuctionCard: React.FC<(typeof ALL_AUCTIONS)[0]> = ({ id, title, artist, category, currentBid, status, endsAt, img }) => {
  const { h, m, s } = useCountdown(endsAt);
  const urgent = h === 0 && m < 10;

  return (
    <article className="auction-card">
      <div className="auction-card__img-wrap">
        <img src={img} alt={title} className="auction-card__img" loading="lazy" />
        <span className={`auction-card__status auction-card__status--${status}`}>
          {status === 'active' ? '● Live' : '◯ Upcoming'}
        </span>
        <span className="auction-card__category-tag">{category}</span>
        {status === 'active' && (
          <div className={`auction-card__timer ${urgent ? 'auction-card__timer--urgent' : ''}`}>
            {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
          </div>
        )}
      </div>
      <div className="auction-card__body">
        <p className="auction-card__artist">{artist}</p>
        <h3 className="auction-card__title">{title}</h3>
        <div className="auction-card__footer">
          <div>
            <span className="auction-card__bid-label">Current bid</span>
            <span className="auction-card__bid">€{currentBid.toLocaleString()}</span>
          </div>
          <Link to={`/auctions/${id}`} className="auction-card__btn">
            {status === 'active' ? 'Bid now →' : 'View →'}
          </Link>
        </div>
      </div>
    </article>
  );
};

/* ── Pagina Principala ── */
const AuctionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('ending-soon');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...ALL_AUCTIONS];
    if (search) list = list.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.artist.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(a => a.category === category);
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (sort === 'ending-soon') list.sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());
    else if (sort === 'highest-bid') list.sort((a, b) => b.currentBid - a.currentBid);
    else if (sort === 'lowest-bid') list.sort((a, b) => a.currentBid - b.currentBid);
    return list;
  }, [search, category, sort, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <main className="auctions-page">
      {/* Header */}
      <section className="auctions-header">
        <div className="container">
          <span className="auctions-header__eyebrow">Marketplace</span>
          <h1 className="auctions-header__title">Live & Upcoming Auctions</h1>
          <p className="auctions-header__sub">
            {ALL_AUCTIONS.filter(a => a.status === 'active').length} active auctions · open to all visitors
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="auctions-filters">
        <div className="container auctions-filters__inner">
          {/* Search */}
          <div className="auctions-filters__search-wrap">
            <span className="auctions-filters__search-icon">🔍</span>
            <input
              className="auctions-filters__search"
              placeholder="Search by title or artist…"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage(); }}
            />
            {search && (
              <button className="auctions-filters__search-clear" onClick={() => { setSearch(''); resetPage(); }}>×</button>
            )}
          </div>

          {/* Category pills */}
          <div className="auctions-filters__pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`auctions-filters__pill ${category === cat ? 'auctions-filters__pill--active' : ''}`}
                onClick={() => { setCategory(cat); resetPage(); }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status + Sort */}
          <div className="auctions-filters__right">
            <div className="auctions-filters__status-tabs">
              {(['all', 'active', 'upcoming'] as const).map(s => (
                <button
                  key={s}
                  className={`auctions-filters__status-tab ${statusFilter === s ? 'auctions-filters__status-tab--active' : ''}`}
                  onClick={() => { setStatusFilter(s); resetPage(); }}
                >
                  {s === 'all' ? 'All' : s === 'active' ? '● Live' : '◯ Upcoming'}
                </button>
              ))}
            </div>
            <select
              className="auctions-filters__sort"
              value={sort}
              onChange={e => { setSort(e.target.value); resetPage(); }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="auctions-results">
        <div className="container">
          <div className="auctions-results__meta">
            <span>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
            {(search || category !== 'All' || statusFilter !== 'all') && (
              <button className="auctions-results__clear" onClick={() => { setSearch(''); setCategory('All'); setStatusFilter('all'); setSort('ending-soon'); resetPage(); }}>
                Clear filters ×
              </button>
            )}
          </div>

          {paginated.length > 0 ? (
            <div className="auctions-grid">
              {paginated.map(a => <AuctionCard key={a.id} {...a} />)}
            </div>
          ) : (
            <div className="auctions-empty">
              <div className="auctions-empty__icon">🖼</div>
              <h3>No auctions found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="auctions-pagination">
              <button
                className="auctions-pagination__btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >← Prev</button>
              <div className="auctions-pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`auctions-pagination__page ${page === p ? 'auctions-pagination__page--active' : ''}`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
              </div>
              <button
                className="auctions-pagination__btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next →</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AuctionPage;