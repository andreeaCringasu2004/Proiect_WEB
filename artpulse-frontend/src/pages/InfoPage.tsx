import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InfoPage.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Tab = 'story' | 'how-it-works' | 'contact';

const InfoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('story');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as Tab;
    if (tabParam && ['story', 'how-it-works', 'contact'].includes(tabParam)) {
      setTab(tabParam);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  return (
    <main className="info-page">
      {/* Hero */}
      <section className="info-hero">
        <div className="container">
          <span className="info-hero__eyebrow">Info</span>
          <h1 className="info-hero__title">About ArtPulse</h1>
          <p className="info-hero__sub">The platform where collectors, artists, and experts converge.</p>
        </div>
      </section>

      {/* Tab navigation */}
      <div className="info-tabs">
        <div className="container info-tabs__inner">
          {([
            { key: 'story', label: 'Our Story' },
            { key: 'how-it-works', label: 'How It Works' },
            { key: 'contact', label: 'Contact & Location' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              className={`info-tab ${tab === t.key ? 'info-tab--active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="info-content">
        <div className="container">

          {/* OUR STORY */}
          {tab === 'story' && (
            <div className="info-section animate-fade-up">
              <div className="info-story">
                <div className="info-story__text">
                  <h2 className="info-story__title">Where the idea began</h2>
                  <p>
                    ArtPulse was born from a simple frustration: the traditional art auction world was opaque,
                    inaccessible, and intimidating for most people. Galleries required invitations. Auction houses
                    favored established collectors. Emerging artists struggled to find serious buyers.
                  </p>
                  <p>
                    In 2024, a small team of art lovers, technologists, and certified evaluators decided to
                    change that. We built a platform that brings the rigor of professional auction houses —
                    expert authentication, transparent pricing, secure transactions — to anyone with a genuine
                    passion for art.
                  </p>
                  <p>
                    Today, ArtPulse connects hundreds of verified artists and galleries with thousands of
                    collectors across Europe. Every work is evaluated by a certified expert before going live.
                    Every transaction is protected. Every bid is real.
                  </p>
                  <div className="info-story__stats">
                    {[
                      { v: '2,400+', l: 'Works auctioned' },
                      { v: '€14M+', l: 'Total value traded' },
                      { v: '180+', l: 'Verified artists' },
                      { v: '12', l: 'Expert evaluators' },
                    ].map(s => (
                      <div key={s.l} className="info-story__stat">
                        <span className="info-story__stat-v">{s.v}</span>
                        <span className="info-story__stat-l">{s.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="info-story__img-col">
                  <img
                    src="https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=700&q=80"
                    alt="ArtPulse gallery"
                    className="info-story__img"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80"
                    alt="Art evaluation"
                    className="info-story__img info-story__img--2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HOW IT WORKS */}
          {tab === 'how-it-works' && (
            <div className="info-section animate-fade-up">
              <h2 className="info-section__title">How ArtPulse works</h2>
              <p className="info-section__sub">From discovery to delivery — a transparent, secure process.</p>

              <div className="how-steps">
                {[
                  {
                    n: '01', icon: '🔍', title: 'Discover',
                    body: 'Browse curated works across painting, sculpture, photography and more. All pieces are visible to guests — no account needed to explore.',
                    detail: 'Filter by category, price range, or auction status. Each listing shows the current bid, time remaining, and expert evaluation notes.'
                  },
                  {
                    n: '02', icon: '📋', title: 'Expert Evaluation',
                    body: 'Every work submitted by a seller goes through a rigorous review by one of our certified Expert Evaluators before it can be auctioned.',
                    detail: 'Experts verify authenticity, assess condition, research provenance, and set a fair starting price. Sellers and experts communicate directly through our chat system.'
                  },
                  {
                    n: '03', icon: '⚡', title: 'Bid Live',
                    body: 'Registered Bidders can place live bids during the auction window. The system ensures no bid can be lower than the current price.',
                    detail: 'You\'ll receive real-time notifications: when an auction starts (if it\'s on your watchlist), at 10 minutes remaining, and at 5 minutes. A valid payment card is required to bid.'
                  },
                  {
                    n: '04', icon: '🏆', title: 'Win & Collect',
                    body: 'When the timer reaches zero, the highest bid wins. The winner is notified immediately and proceeds to secure payment.',
                    detail: 'ArtPulse handles the transaction securely. Once payment is confirmed, the seller arranges delivery. You can track shipping status directly in your account.'
                  },
                ].map((step, i) => (
                  <div key={step.n} className="how-step" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="how-step__num">{step.n}</div>
                    <div className="how-step__icon">{step.icon}</div>
                    <div className="how-step__content">
                      <h3 className="how-step__title">{step.title}</h3>
                      <p className="how-step__body">{step.body}</p>
                      <p className="how-step__detail">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Roles explanation */}
              <div className="info-roles">
                <h3 className="info-roles__title">User roles on ArtPulse</h3>
                <div className="info-roles__grid">
                  {[
                    { role: 'Guest', icon: '👁', desc: 'Browse all public auctions and listings without an account.' },
                    { role: 'Bidder', icon: '🤝', desc: 'Register and validate a payment card to place live bids.' },
                    { role: 'Seller', icon: '🖼', desc: 'Submit artworks for evaluation and launch auctions.' },
                    { role: 'Expert', icon: '🏅', desc: 'Evaluate works, set prices, and communicate with sellers.' },
                    { role: 'Admin', icon: '⚙️', desc: 'Manage users, monitor platform health and audit history.' },
                  ].map(r => (
                    <div key={r.role} className="info-role-card">
                      <div className="info-role-card__icon">{r.icon}</div>
                      <h4 className="info-role-card__role">{r.role}</h4>
                      <p className="info-role-card__desc">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTACT & MAP */}
          {tab === 'contact' && (
            <div className="info-section animate-fade-up">
              <div className="info-contact">
                <div className="info-contact__details">
                  <h2 className="info-contact__title">Get in touch</h2>
                  <p className="info-contact__sub">
                    Our team is based in Bucharest. Visit us, send an email, or reach out through social media.
                  </p>
                  <div className="info-contact__items">
                    {[
                      { icon: '📍', label: 'Address', value: 'Calea Victoriei 12, Sector 1\nBucharest, Romania' },
                      { icon: '✉️', label: 'Email', value: 'hello@artpulse.ro' },
                      { icon: '📞', label: 'Phone', value: '+40 21 000 0000' },
                      { icon: '🕐', label: 'Hours', value: 'Mon–Fri: 9:00–18:00\nSat: 10:00–14:00' },
                    ].map(item => (
                      <div key={item.label} className="info-contact__item">
                        <span className="info-contact__item-icon">{item.icon}</span>
                        <div>
                          <span className="info-contact__item-label">{item.label}</span>
                          <span className="info-contact__item-value" style={{ whiteSpace: 'pre-line' }}>{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Embedded Google Map */}
                <div className="info-contact__map-wrap">
                  <div className="info-contact__map-label">📍 ArtPulse HQ · Calea Victoriei 12, Bucharest</div>

                  <div className="info-contact__map-container">
                    <MapContainer
                      center={[44.4326, 26.0988]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="info-leaflet-map"
                      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[44.4326, 26.0988]}>
                        <Popup>
                          ArtPulse HQ <br /> Calea Victoriei 12
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <a
                    className="info-contact__map-link"
                    href="https://www.google.com/maps/search/?api=1&query=Calea+Victoriei+12,+Bucharest"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default InfoPage;