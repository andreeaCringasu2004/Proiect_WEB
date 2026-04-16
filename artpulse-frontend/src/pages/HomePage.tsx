import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

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
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  });
  return t;
};

const FEATURED = [
  {
    id: 1,
    title: 'Lumière dorée',
    artist: 'Marie Leblanc',
    category: 'Painting',
    currentBid: 4_200,
    endsAt: new Date(Date.now() + 2 * 3_600_000 + 14 * 60_000),
    img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
  },
  {
    id: 2,
    title: 'Silent Forms',
    artist: 'Kenji Watanabe',
    category: 'Sculpture',
    currentBid: 8_750,
    endsAt: new Date(Date.now() + 5 * 3_600_000 + 33 * 60_000),
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 3,
    title: 'Urban Abstraction',
    artist: 'Sofia Petrov',
    category: 'Photography',
    currentBid: 1_900,
    endsAt: new Date(Date.now() + 11 * 3_600_000 + 5 * 60_000),
    img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80',
  },
];

const ArtCard: React.FC<(typeof FEATURED)[0]> = ({ title, artist, category, currentBid, endsAt, img }) => {
  const { h, m, s } = useCountdown(endsAt);
  const urgent = h === 0 && m < 10;

  return (
    <article className="art-card">
      <div className="art-card__img-wrap">
        <img src={img} alt={title} className="art-card__img" loading="lazy" />
        <span className="art-card__category">{category}</span>
        <div className={`art-card__timer ${urgent ? 'art-card__timer--urgent' : ''}`}>
          {urgent && <span className="art-card__timer-dot" />}
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </div>
      </div>
      <div className="art-card__body">
        <p className="art-card__artist">{artist}</p>
        <h3 className="art-card__title">{title}</h3>
        <div className="art-card__footer">
          <div>
            <span className="art-card__label">Current bid</span>
            <span className="art-card__bid">€{currentBid.toLocaleString()}</span>
          </div>
          <Link to="/login" className="art-card__bid-btn">Bid now →</Link>
        </div>
      </div>
    </article>
  );
};


const AccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>×</button>
        <div className="modal__icon">🎨</div>
        <h2 className="modal__title">How would you like to continue?</h2>
        <p className="modal__sub">Join ArtPulse to bid, sell, and discover exceptional art.</p>
        <div className="modal__actions">
          <Link to="/register" className="modal__btn modal__btn--primary">
            Create an account
            <span>Bid, sell & track your collection</span>
          </Link>
          <Link to="/login" className="modal__btn modal__btn--secondary">
            Sign in
            <span>Continue to your account</span>
          </Link>
          <Link to="/auctions" className="modal__btn modal__btn--ghost">
            Browse as Guest
            <span>View active auctions — no account needed</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const STATS = [
  { value: '2,400+', label: 'Works auctioned' },
  { value: '€14M+', label: 'Total sales' },
  { value: '180+', label: 'Verified artists' },
  { value: '98%', label: 'Satisfaction rate' },
];

const STEPS = [
  { n: '01', title: 'Discover', body: 'Browse curated works across painting, sculpture, photography and more.' },
  { n: '02', title: 'Evaluate', body: 'Each work is reviewed by a certified expert who sets a fair starting price.' },
  { n: '03', title: 'Bid', body: 'Place live bids and receive real-time alerts as the auction reaches its close.' },
  { n: '04', title: 'Collect', body: 'Secure your acquisition with a verified payment and receive your artwork.' },
];

const HomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__bg-img" />
          <div className="hero__bg-overlay" />
          <div className="hero__bg-grid" />
        </div>
        <div className="container hero__content">
          <div className="hero__text animate-fade-up">
            <span className="hero__eyebrow">Fine Art Auctions</span>
            <h1 className="hero__headline">
              Where great art<br />
              <em>finds its voice.</em>
            </h1>
            <p className="hero__sub">
              Discover, bid, and collect museum-quality works from emerging and established artists—
              guided by certified expert evaluators.
            </p>
            <div className="hero__ctas">
              <button className="hero__cta hero__cta--primary" onClick={() => setShowModal(true)}>
                Explore auctions
              </button>
              <a href="#how" className="hero__cta hero__cta--ghost">How it works ↓</a>
            </div>
          </div>
          <div className="hero__card-preview animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="hero__preview-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=700&q=80"
                alt="Featured artwork"
                className="hero__preview-img"
              />
              <div className="hero__preview-badge">
                <span className="hero__preview-badge-dot" />
                Live auction
              </div>
            </div>
            <div className="hero__preview-info">
              <span className="hero__preview-artist">Marie Leblanc</span>
              <span className="hero__preview-title">Lumière dorée, 2023</span>
              <div className="hero__preview-bid">
                <div>
                  <div className="hero__preview-label">Current bid</div>
                  <div className="hero__preview-amount">€4,200</div>
                </div>
                <button className="hero__preview-btn" onClick={() => setShowModal(true)}>Bid →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-strip">
        <div className="container stats-strip__inner">
          {STATS.map(s => (
            <div key={s.label} className="stat">
              <span className="stat__value">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured auctions */}
      <section className="section featured" id="featured">
        <div className="container">
          <div className="section__head">
            <div>
              <span className="section__eyebrow">Featured right now</span>
              <h2 className="section__title">Live Auctions</h2>
            </div>
            <Link to="/auctions" className="section__see-all">View all auctions →</Link>
          </div>
          <div className="art-grid">
            {FEATURED.map(item => <ArtCard key={item.id} {...item} />)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how" id="how">
        <div className="container">
          <div className="section__head">
            <div>
              <span className="section__eyebrow">The process</span>
              <h2 className="section__title">How ArtPulse works</h2>
            </div>
          </div>
          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={step.n} className="step" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="step__num">{step.n}</span>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a seller CTA */}
      <section className="section seller-cta" id="about">
        <div className="container">
          <div className="seller-cta__inner">
            <div className="seller-cta__text">
              <span className="section__eyebrow">For artists & galleries</span>
              <h2 className="seller-cta__title">Sell your work to the world's most passionate collectors</h2>
              <p className="seller-cta__sub">
                Submit your pieces for expert evaluation, set your reserve price, and reach thousands
                of qualified buyers through our curated marketplace.
              </p>
              <Link to="/register" className="seller-cta__btn">Apply as a Seller →</Link>
            </div>
            <div className="seller-cta__gallery">
              <img src="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=600&q=80" alt="Gallery" className="seller-cta__img seller-cta__img--1" />
              <img src="https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=400&q=80" alt="Art" className="seller-cta__img seller-cta__img--2" />
            </div>
          </div>
        </div>
      </section>

      {/* Access modal */}
      {showModal && <AccessModal onClose={() => setShowModal(false)} />}
    </main>
  );
};

export default HomePage;