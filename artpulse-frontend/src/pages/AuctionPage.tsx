import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './AuctionPage.css';


const CATEGORIES = ['All', 'Painting', 'Sculpture', 'Photography', 'Mixed Media'];
const SORT_OPTIONS = [
  { value: 'ending-soon', label: 'Ending soon' },
  { value: 'highest-bid', label: 'Highest bid' },
  { value: 'lowest-bid', label: 'Lowest bid' },
  { value: 'newest', label: 'Newest' },
];
const ITEMS_PER_PAGE = 6;

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
  const [t, setT] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
};

interface CardProps {
  id: number;
  title: string;
  artist: string;
  category: string;
  currentBid: number;
  bidsCount: number;
  status: string;
  endsAt: string;
  image: string;
}
const AuctionCard: React.FC<CardProps> = ({
  id, title, artist, category, currentBid, bidsCount, status, endsAt, image,
}) => {
  const { h, m, s, expired } = useCountdown(new Date(endsAt));
  const urgent = !expired && h === 0 && m < 10;

  let computedStatus = status;
  let statusText = status === 'active' ? '● Live' : status === 'sold' ? '● Sold' : '◯ Upcoming';

  if (status === 'active' && expired) {
    if (bidsCount > 0) {
      computedStatus = 'sold';
      statusText = '● Sold';
    } else {
      computedStatus = 'upcoming';
      statusText = '◯ Upcoming';
    }
  }

  return (
    <article className="auction-card">
      <div className="auction-card__img-wrap">
        <img src={image} alt={title} className="auction-card__img" loading="lazy" />
        <span className={`auction-card__status auction-card__status--${computedStatus}`}>
          {statusText}
        </span>
        <span className="auction-card__category-tag">{category}</span>
        {status === 'active' && !expired && (
          <div className={`auction-card__timer ${urgent ? 'auction-card__timer--urgent' : ''}`}>
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
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
          <Link to={`/auctions/${id}`} className={`auction-card__btn ${expired ? 'auction-card__btn--expired' : ''}`}>
            {expired ? 'View Details' : (status === 'active' ? 'Bid now →' : 'View →')}
          </Link>
        </div>
      </div>
    </article>
  );
};


const AuctionPage: React.FC = () => {
  const { auctions } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('ending-soon');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'sold'>('all');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const resetPage = () => setPage(1);

  const filtered = useMemo(() => {
    let list = [...auctions];

    const getComputedStatus = (a: any) => {
      const expired = new Date(a.endsAt).getTime() < Date.now();
      if (a.status === 'active' && expired) {
        return a.bidsCount > 0 ? 'sold' : 'upcoming';
      }
      return a.status;
    };

    if (search) list = list.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.artist.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(a => a.category === category);

    if (statusFilter !== 'all') {
      list = list.filter(a => getComputedStatus(a) === statusFilter);
    }

    if (sort === 'ending-soon') list.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    else if (sort === 'highest-bid') list.sort((a, b) => b.currentBid - a.currentBid);
    else if (sort === 'lowest-bid') list.sort((a, b) => a.currentBid - b.currentBid);
    return list;
  }, [search, category, sort, statusFilter, auctions]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hasActiveFilters = search || category !== 'All' || statusFilter !== 'all';

  const clearAll = () => {
    setSearch(''); setCategory('All');
    setStatusFilter('all'); setSort('ending-soon');
    resetPage();
  };

  return (
    <main className="auctions-page">

      {/* ── Sticky filter bar ── */}
      <div className="auctions-filters">
        <div className="container">

          {/* Top row: search + toggle button */}
          <div className="af-top-row">
            {/* Search */}
            <div className="af-search-wrap">
              <span className="af-search-icon">🔍</span>
              <input
                className="af-search"
                placeholder="Search by title or artist…"
                value={search}
                onChange={e => { setSearch(e.target.value); resetPage(); }}
              />
              {search && (
                <button className="af-search-clear" onClick={() => { setSearch(''); resetPage(); }}>×</button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              className={`af-toggle ${filtersOpen ? 'af-toggle--open' : ''}`}
              onClick={() => setFiltersOpen(v => !v)}
              aria-expanded={filtersOpen}
            >
              <span>Filters</span>
              <svg className="af-toggle__arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {hasActiveFilters && <span className="af-toggle__dot" />}
            </button>
          </div>

          {/* Collapsible panel */}
          <div className={`af-panel ${filtersOpen ? 'af-panel--open' : ''}`}>
            <div className="af-controls">
              {/* Category Dropdown */}
              <div className="af-filter-group">
                <label className="af-filter-label">Category</label>
                <select
                  className="af-select"
                  value={category}
                  onChange={e => { setCategory(e.target.value); resetPage(); }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="af-filter-group">
                <label className="af-filter-label">Status</label>
                <select
                  className="af-select"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value as any); resetPage(); }}
                >
                  {(['all', 'active', 'upcoming', 'sold'] as const).map(s => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All statuses' : s === 'active' ? '● Live' : s === 'sold' ? '● Sold / Ended' : '◯ Upcoming'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="af-filter-group">
                <label className="af-filter-label">Sort by</label>
                <select
                  className="af-select"
                  value={sort}
                  onChange={e => { setSort(e.target.value); resetPage(); }}
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Results ── */}
      <section className="auctions-results">
        <div className="container">
          <div className="auctions-results__meta">
            <span>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</span>
            {hasActiveFilters && (
              <button className="auctions-results__clear" onClick={clearAll}>
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

          {totalPages > 1 && (
            <div className="auctions-pagination">
              <button className="auctions-pagination__btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <div className="auctions-pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`auctions-pagination__page ${page === p ? 'auctions-pagination__page--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
              </div>
              <button className="auctions-pagination__btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AuctionPage;