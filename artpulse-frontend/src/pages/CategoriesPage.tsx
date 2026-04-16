import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './CategoriesPage.css';


const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80', title: 'Lumière dorée', artist: 'Marie Leblanc' },
  { src: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80', title: 'Midnight Canvas', artist: 'Arjun Mehta' },
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', title: 'Silent Forms', artist: 'Kenji Watanabe' },
  { src: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&q=80', title: 'Urban Abstraction', artist: 'Sofia Petrov' },
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80', title: 'Terra Nova', artist: 'Hana Sato' },
  { src: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80', title: 'The Silence', artist: 'Andrei Constantin' },
];


const CATEGORIES = [
  {
    key: 'Painting',
    img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700&q=80',
    desc: 'Oil, acrylic, watercolour and mixed pigment works on canvas, board and paper.',
    count: 4,
    auctions: [
      { id: 1, title: 'Lumière dorée', artist: 'Marie Leblanc', bid: 4200, status: 'active', time: '2:14:03', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80' },
      { id: 4, title: 'Golden Hour', artist: 'Ama Diallo', bid: 3100, status: 'upcoming', time: 'Starts in 24h', img: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80' },
      { id: 7, title: 'Midnight Canvas', artist: 'Arjun Mehta', bid: 2300, status: 'upcoming', time: 'Starts in 48h', img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80' },
      { id: 9, title: 'Echoes of Blue', artist: 'Theo Andersen', bid: 6800, status: 'active', time: '9:00:00', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
    ],
  },
  {
    key: 'Sculpture',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    desc: 'Three-dimensional works in bronze, marble, ceramic, wood and contemporary materials.',
    count: 3,
    auctions: [
      { id: 2, title: 'Silent Forms', artist: 'Kenji Watanabe', bid: 8750, status: 'active', time: '5:33:00', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
      { id: 6, title: 'Terra Nova', artist: 'Hana Sato', bid: 5500, status: 'active', time: '7:00:00', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80' },
      { id: 10, title: 'Stone Memory', artist: 'Marco Ricci', bid: 1200, status: 'upcoming', time: 'Starts in 3d', img: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&q=80' },
    ],
  },
  {
    key: 'Photography',
    img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=700&q=80',
    desc: 'Fine-art prints, limited editions and documentary photography from international artists.',
    count: 2,
    auctions: [
      { id: 3, title: 'Urban Abstraction', artist: 'Sofia Petrov', bid: 1900, status: 'active', time: '11:05:00', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80' },
      { id: 5, title: 'Deep Waters', artist: 'Luca Romano', bid: 920, status: 'active', time: '3:20:00', img: 'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80' },
    ],
  },
  {
    key: 'Mixed Media',
    img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=700&q=80',
    desc: 'Works combining multiple disciplines: collage, assemblage, digital-physical hybrids.',
    count: 1,
    auctions: [
      { id: 8, title: 'Fragile Geometry', artist: 'Ines Moreau', bid: 1450, status: 'active', time: '1:45:00', img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600&q=80' },
    ],
  },
];


const AutoGallery: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((n: number) => {
    setCurrent((n + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(p => (p + 1) % GALLERY_IMAGES.length), 3000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleManual = (n: number) => { go(n); resetTimer(); };

  return (
    <section className="cats-gallery">
      <div className="container cats-gallery__inner">
        <div className="cats-gallery__head">
          <h2 className="cats-gallery__title">Gallery — Curated Works</h2>
          <p className="cats-gallery__sub">A rotating showcase of remarkable pieces from our collection.</p>
        </div>

        <div className="cats-gallery__hero">
          {GALLERY_IMAGES.map((img, i) => (
            <img
              key={img.src}
              src={img.src}
              alt={img.title}
              className={`cats-gallery__img ${i === current ? 'cats-gallery__img--active' : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          <div className="cats-gallery__overlay" />

          <div className="cats-gallery__caption">
            <span className="cats-gallery__cap-num">
              {String(current + 1).padStart(2, '0')} / {String(GALLERY_IMAGES.length).padStart(2, '0')}
            </span>
            <div className="cats-gallery__cap-title">{GALLERY_IMAGES[current].title}</div>
            <div className="cats-gallery__cap-artist">{GALLERY_IMAGES[current].artist}</div>
          </div>

          <div className="cats-gallery__controls">
            <button className="cats-gallery__arrow" onClick={() => handleManual(current - 1)}>←</button>
            <button className="cats-gallery__arrow" onClick={() => handleManual(current + 1)}>→</button>
          </div>

          {/* Progress bar — resets on each slide change */}
          <div className="cats-gallery__progress-wrap">
            <div className="cats-gallery__progress" key={current} />
          </div>
        </div>

        {/* Filmstrip */}
        <div className="cats-gallery__filmstrip">
          {GALLERY_IMAGES.map((img, i) => (
            <button
              key={img.src}
              className={`cats-gallery__film-thumb ${i === current ? 'cats-gallery__film-thumb--active' : ''}`}
              onClick={() => handleManual(i)}
            >
              <img src={img.src} alt={img.title} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

interface CatAuctionCardProps {
  id: number; title: string; artist: string; bid: number;
  status: string; time: string; img: string;
}
const CatAuctionCard: React.FC<CatAuctionCardProps> = ({ id, title, artist, bid, status, time, img }) => (
  <article className="cat-auction-card">
    <div className="cat-auction-card__img-wrap">
      <img src={img} alt={title} className="cat-auction-card__img" loading="lazy" />
      <span className={`cat-auction-card__status ${status === 'active' ? 'cat-auction-card__status--live' : 'cat-auction-card__status--upcoming'}`}>
        {status === 'active' ? '● Live' : '◯ Upcoming'}
      </span>
      <div className="cat-auction-card__timer">{time}</div>
    </div>
    <div className="cat-auction-card__body">
      <p className="cat-auction-card__artist">{artist}</p>
      <h4 className="cat-auction-card__title">{title}</h4>
      <div className="cat-auction-card__footer">
        <div>
          <span className="cat-auction-card__bid-lbl">
            {status === 'active' ? 'Current bid' : 'Starting bid'}
          </span>
          <span className="cat-auction-card__bid">€{bid.toLocaleString()}</span>
        </div>
        <div className="cat-auction-card__actions">
          <Link to={`/auctions/${id}`} className="cat-auction-card__btn cat-auction-card__btn--detail">
            Details
          </Link>
          <Link to={`/auctions/${id}`} className="cat-auction-card__btn cat-auction-card__btn--bid">
            {status === 'active' ? 'Bid →' : 'View →'}
          </Link>
        </div>
      </div>
    </div>
  </article>
);

const CategoriesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const allKeys = ['All', ...CATEGORIES.map(c => c.key)];

  const visibleCategories = activeFilter === 'All'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.key === activeFilter);

  return (
    <main className="cats-page">
      {/* Header */}
      <section className="cats-header">
        <div className="container">
          <span className="cats-header__eyebrow">Browse</span>
          <h1 className="cats-header__title">Explore by Category</h1>
          <p className="cats-header__sub">
            {CATEGORIES.reduce((s, c) => s + c.auctions.length, 0)} active lots across{' '}
            {CATEGORIES.length} disciplines
          </p>
        </div>
      </section>

      {/* Filter pills */}
      <div className="cats-filters">
        <div className="container cats-filters__inner">
          {allKeys.map(key => (
            <button
              key={key}
              className={`cats-filter-pill ${activeFilter === key ? 'cats-filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Category overview grid */}
      {activeFilter === 'All' && (
        <section className="cats-overview">
          <div className="container">
            <div className="cats-overview__grid">
              {CATEGORIES.map(cat => (
                <div
                  key={cat.key}
                  className="cats-overview__card"
                  onClick={() => setActiveFilter(cat.key)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setActiveFilter(cat.key)}
                >
                  <div className="cats-overview__img-wrap">
                    <img src={cat.img} alt={cat.key} className="cats-overview__img" loading="lazy" />
                    <div className="cats-overview__overlay" />
                  </div>
                  <div className="cats-overview__info">
                    <h3 className="cats-overview__name">{cat.key}</h3>
                    <p className="cats-overview__desc">{cat.desc}</p>
                    <div className="cats-overview__footer">
                      <span className="cats-overview__count">{cat.count} active lots</span>
                      <button className="cats-overview__explore">Explore →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Auction listings per category */}
      <div className="container">
        {visibleCategories.map(cat => (
          <section key={cat.key} className="cats-section">
            <div className="cats-section__head">
              <div>
                <h2 className="cats-section__title">{cat.key}</h2>
                <p className="cats-section__sub">{cat.desc}</p>
              </div>
              <Link to="/auctions" className="cats-section__see-all">
                See all {cat.key.toLowerCase()} →
              </Link>
            </div>
            <div className="cats-auction-grid">
              {cat.auctions.map(a => <CatAuctionCard key={a.id} {...a} />)}
            </div>
          </section>
        ))}
      </div>

      {/* Auto Gallery (auto-rotates every 3 seconds) */}
      <AutoGallery />

      {/* Newsletter strip */}
      <section className="cats-newsletter">
        <div className="container cats-newsletter__inner">
          <div>
            <h3 className="cats-newsletter__title">Never miss an auction</h3>
            <p className="cats-newsletter__sub">
              Get notified when new works in your favourite categories go live.
            </p>
          </div>
          <div className="cats-newsletter__form">
            <input
              type="email"
              className="cats-newsletter__input"
              placeholder="your@email.com"
              id="catsNlEmail"
            />
            <button
              className="cats-newsletter__btn"
              onClick={() => {
                const el = document.getElementById('catsNlEmail') as HTMLInputElement;
                if (!el?.value.includes('@')) return;
                el.value = '';
                alert('✓ Subscribed!');
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoriesPage;