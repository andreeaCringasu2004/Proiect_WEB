import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SellerDashboard.css';

interface SellerProduct {
  id: number;
  title: string;
  category: string;
  startingPrice: number | null;
  suggestedPrice: number | null;
  status: 'draft' | 'pending_review' | 'approved' | 'live' | 'sold' | 'rejected';
  createdAt: string;
  img: string;
  bids?: number;
  currentBid?: number;
}

const SELLER_PRODUCTS: SellerProduct[] = [
  { id: 1, title: 'Untitled (Red Series #3)', category: 'Unknown — Pending Expert', startingPrice: null, suggestedPrice: null, status: 'pending_review', createdAt: '2 hours ago', img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&q=80' },
  { id: 2, title: 'Figura în Repaus', category: 'Sculpture', startingPrice: 1200, suggestedPrice: 1500, status: 'approved', createdAt: '3 days ago', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 3, title: 'Peisaj de Iarnă', category: 'Painting', startingPrice: 800, suggestedPrice: 900, status: 'live', createdAt: '5 days ago', img: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80', bids: 6, currentBid: 1050 },
  { id: 4, title: 'Abstract Blue', category: 'Mixed Media', startingPrice: 500, suggestedPrice: 600, status: 'sold', createdAt: '2 weeks ago', img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&q=80', currentBid: 780 },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Expert Review',
  approved: 'Approved — Ready to Launch',
  live: 'Live Auction',
  sold: 'Sold',
  rejected: 'Rejected',
};

const AddProductModal: React.FC<{ onClose: () => void; onAdd: (p: SellerProduct) => void }> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: '', description: '', medium: '', year: '', dimensions: '' });
  const [file, setFile] = useState<string | null>(null);

  const submit = () => {
    if (!form.title.trim()) return;
    onAdd({
      id: Date.now(), title: form.title, category: 'Unknown — Pending Expert',
      startingPrice: null, suggestedPrice: null, status: 'pending_review',
      createdAt: 'Just now',
      img: file ?? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
    });
    onClose();
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal pm-modal--wide" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>×</button>
        <div className="pm-header">
          <div className="pm-icon">🖼</div>
          <h2 className="pm-title">Submit New Product</h2>
          <p className="pm-sub">Your product will be reviewed by an Expert Evaluator before going live.</p>
        </div>
        <div className="pm-fields">
          <div className="pm-field"><label className="pm-label">Title *</label><input className="pm-input" placeholder="Artwork title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div className="pm-row">
            <div className="pm-field"><label className="pm-label">Medium</label><input className="pm-input" placeholder="Oil on canvas" value={form.medium} onChange={e => setForm(p => ({ ...p, medium: e.target.value }))} /></div>
            <div className="pm-field"><label className="pm-label">Year</label><input className="pm-input" placeholder="2024" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} /></div>
          </div>
          <div className="pm-field"><label className="pm-label">Dimensions</label><input className="pm-input" placeholder="100 × 80 cm" value={form.dimensions} onChange={e => setForm(p => ({ ...p, dimensions: e.target.value }))} /></div>
          <div className="pm-field"><label className="pm-label">Description</label><textarea className="pm-input" style={{ minHeight: 80, resize: 'vertical' }} placeholder="Describe the work, provenance, condition…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="pm-field">
            <label className="pm-label">Upload Image</label>
            <div className="seller-upload-area">
              <span>📷 Click to upload or drag &amp; drop</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>JPG, PNG — max 10MB</span>
            </div>
          </div>
          <p className="pm-note">Category will be assigned to "Unknown" until an Expert reviews it. You cannot set a starting price yet.</p>
          <button className="pm-confirm-btn" onClick={submit}>Submit for Review →</button>
        </div>
      </div>
    </div>
  );
};

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user || (user.role !== 'seller' && user.role !== 'admin')) return <Navigate to="/" replace />;

  const [products, setProducts] = useState(SELLER_PRODUCTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const launchAuction = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'live' as const } : p));
    showToast('✓ Auction launched! Your product is now live.');
  };

  return (
    <main className="seller-page">
      {/* Header */}
      <div className="seller-header">
        <div className="container seller-header__inner">
          <div>
            <span className="seller-header__eyebrow">Seller Dashboard</span>
            <h1 className="seller-header__title">My Products</h1>
            <p className="seller-header__sub">{products.length} products · {products.filter(p => p.status === 'live').length} live</p>
          </div>
          <button className="seller-add-btn" onClick={() => setShowAdd(true)}>+ Submit New Product</button>
        </div>
      </div>

      <div className="container seller-content">
        {/* Stats */}
        <div className="seller-stats">
          {[
            { label: 'Total Products', value: String(products.length) },
            { label: 'Pending Review', value: String(products.filter(p => p.status === 'pending_review').length) },
            { label: 'Live Now', value: String(products.filter(p => p.status === 'live').length) },
            { label: 'Total Sold', value: String(products.filter(p => p.status === 'sold').length) },
          ].map(s => (
            <div key={s.label} className="seller-stat">
              <span className="seller-stat__value">{s.value}</span>
              <span className="seller-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="seller-filters">
          <input className="seller-search" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="seller-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="live">Live</option>
            <option value="sold">Sold</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="seller-table-wrap">
          <table className="seller-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Start Price</th>
                <th>Expert Suggestion</th><th>Bids / Current</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="seller-table__product">
                      <img src={p.img} alt={p.title} className="seller-table__img" />
                      <div>
                        <div className="seller-table__title">{p.title}</div>
                        <div className="seller-table__date">{p.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`seller-cat ${p.category.startsWith('Unknown') ? 'seller-cat--unknown' : 'seller-cat--known'}`}>
                      {p.category}
                    </span>
                  </td>
                  <td>{p.startingPrice ? `€${p.startingPrice.toLocaleString()}` : <span style={{ color: 'var(--ink-faint)' }}>—</span>}</td>
                  <td>
                    {p.suggestedPrice
                      ? <span className="seller-suggestion">💡 €{p.suggestedPrice.toLocaleString()}</span>
                      : <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>Awaiting expert</span>}
                  </td>
                  <td>
                    {p.status === 'live' || p.status === 'sold'
                      ? `${p.bids ?? 0} bids · €${(p.currentBid ?? 0).toLocaleString()}`
                      : <span style={{ color: 'var(--ink-faint)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <span className={`seller-status seller-status--${p.status}`}>{STATUS_LABELS[p.status]}</span>
                  </td>
                  <td>
                    <div className="seller-actions">
                      {p.status === 'approved' && (
                        <button className="seller-action-btn seller-action-btn--launch"
                          onClick={() => launchAuction(p.id)}>Launch →</button>
                      )}
                      {p.status === 'live' && (
                        <Link to={`/auctions/${p.id}`} className="seller-action-btn seller-action-btn--view">View Live</Link>
                      )}
                      {(p.status === 'draft' || p.status === 'pending_review') && (
                        <button className="seller-action-btn seller-action-btn--edit"
                          onClick={() => showToast('Edit form coming soon.')}>Edit</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-muted)' }}>No products match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onAdd={(p) => { setProducts(prev => [p, ...prev]); showToast('✓ Product submitted for expert review!'); }} />}
      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default SellerDashboard;