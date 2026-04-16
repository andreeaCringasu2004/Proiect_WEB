import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData, Product } from '../context/DataContext';
import './SellerDashboard.css';


const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Expert Review',
  approved: 'Upcoming — Ready to Launch',
  PENDING: 'Pending Expert Review',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Upcoming — Ready to Launch',
  REJECTED: 'Rejected by Expert',
  LIVE: 'Live Auction',
  live: 'Live Auction',
  sold: 'Sold',
  rejected: 'Rejected',
  active: 'Live Auction',
  upcoming: 'Upcoming',
};

const AddProductModal: React.FC<{ onClose: () => void; onAdd: (p: any) => void }> = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: '', description: '', medium: '', year: '', dimensions: '' });
  const [docs, setDocs] = useState<string[]>([]);
  const docRef = useRef<HTMLInputElement>(null);
  const file = null;

  const submit = () => {
    if (!form.title.trim()) return;
    onAdd({
      id: Date.now(),
      title: form.title,
      description: form.description,
      medium: form.medium,
      year: form.year,
      dimensions: form.dimensions,
      category: 'Unknown — Pending Expert',
      startingPrice: null,
      suggestedPrice: null,
      status: 'PENDING',
      createdAt: 'Just now',
      submittedAt: 'Just now',
      img: file ?? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
      images: [file ?? 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80'],
      documents: docs
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
              <span>📷 Click to upload or drag &amp; drop artwork photo</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>JPG, PNG — max 10MB</span>
            </div>
          </div>

          <div className="pm-field">
            <label className="pm-label">Relevant Documents (Certificates, Provenance)</label>
            <div className="seller-upload-area" onClick={() => docRef.current?.click()} style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
              <span>📄 Click to attach documents</span>
              <input type="file" multiple hidden ref={docRef} onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setDocs(prev => [...prev, ...files.map(f => f.name)]);
              }} />
            </div>
            {docs.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {docs.map((d, i) => (
                  <span key={i} style={{ fontSize: 11, background: 'var(--ink-faint)', padding: '4px 8px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {d} <span style={{ cursor: 'pointer', color: 'var(--error)' }} onClick={(e) => { e.stopPropagation(); setDocs(p => p.filter((_, idx) => idx !== i)); }}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="pm-note">Category will be assigned to "Unknown" until an Expert reviews it. You can request a formal evaluation after submission.</p>
          <button className="pm-confirm-btn" onClick={submit}>Submit for Review →</button>
        </div>
      </div>
    </div>
  );
};


const RequestEvalModal: React.FC<{ product: any; onClose: () => void; onSubmit: (message: string, docs: string[]) => void }> = ({ product, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [docs, setDocs] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocs(prev => [...prev, ...files.map(f => f.name)]);
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit(message, docs);
    onClose();
  };

  return (
    <div className="pm-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="pm-modal pm-modal--wide" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>×</button>
        <div className="pm-header">
          <div className="pm-icon">📨</div>
          <h2 className="pm-title">Request Expert Evaluation</h2>
          <p className="pm-sub">Send a request to all available experts for: <strong>{product.title}</strong></p>
        </div>
        <div className="pm-fields">
          <div className="pm-field">
            <label className="pm-label">Message to Expert *</label>
            <textarea
              className="pm-input"
              style={{ minHeight: 100, resize: 'vertical' }}
              placeholder="Descrieti pe scurt lucrarea, istoricul ei, eventuale documente atasate..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
          <div className="pm-field">
            <label className="pm-label">📎 Attach Documents (optional)</label>
            <div
              className="seller-upload-area"
              style={{ cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}
            >
              <span>📁 Click to attach PDF, JPG, PNG</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>Certificates, photos of reverse, provenance docs...</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {docs.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {docs.map((d, i) => (
                  <span key={i} style={{ background: 'var(--parchment)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📄 {d}
                    <button onClick={() => setDocs(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rust)', fontWeight: 700 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="pm-note">O notificare va fi trimisă către expertii disponibili. Primul care acceptă va prelua evaluarea produsului tău.</p>
          <button className="pm-confirm-btn" onClick={handleSubmit} disabled={!message.trim()} style={{ opacity: message.trim() ? 1 : 0.5 }}>
            Trimite Cerere →
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatModal: React.FC<{ product: Product; expertId: number; onClose: () => void }> = ({ product, expertId, onClose }) => {
  const { user } = useAuth();
  const { messages, addMessage, users, updateProduct } = useData();
  const [inputTitle, setInputTitle] = useState('');
  const [chatDocs, setChatDocs] = useState<string[]>([]);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 100);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputTitle]);

  const productMsgs = messages.filter(m => m.productId === product.id);
  const expertName = users.find(u => u.id === expertId)?.name || 'Expert';

  const send = (text: string) => {
    if ((!text.trim() && chatDocs.length === 0) || !user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addMessage({
      id: Date.now(),
      productId: product.id,
      fromId: user.id || 0,
      toId: expertId,
      text: text.trim(),
      time,
      documents: chatDocs
    });

    if (chatDocs.length > 0) {
      const existingDocs = product.documents || [];
      const updatedDocs = Array.from(new Set([...existingDocs, ...chatDocs]));
      updateProduct({ ...product, documents: updatedDocs });
    }

    setInputTitle('');
    setChatDocs([]);

    if (text === 'Cum decurge procesul de evaluare?') {
      setTimeout(() => {
        addMessage({ id: Date.now() + 1, productId: product.id, fromId: expertId, toId: user.id || 0, text: 'Procesul presupune o verificare fizică a obiectului, pentru a-i evalua autenticitatea, condiția materialelor și calitatea generală. Vă voi contacta pentru stabilirea unei întâlniri.', time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` });
      }, 800);
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal pm-modal--wide" onClick={e => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose}>×</button>
        <div className="pm-header" style={{ marginBottom: '12px', textAlign: 'left', paddingRight: '40px' }}>
          <h2 className="pm-title" style={{ fontSize: '1.2rem', marginBottom: '2px' }}>Chat cu {expertName}</h2>
          <p className="pm-sub" style={{ fontSize: '12px' }}>Evaluare: {product.title}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-alt)', padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {productMsgs.length === 0 && <div style={{ color: 'var(--ink-muted)', textAlign: 'center', margin: 'auto' }}>Niciun mesaj încă. Scrieți o întrebare expertului.</div>}
          {productMsgs.map(m => {
            const isOwn = m.fromId === user?.id;
            return (
              <div key={m.id} style={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                background: isOwn ? 'var(--ink)' : 'var(--white)',
                color: isOwn ? 'var(--white)' : 'var(--ink)',
                padding: '10px 14px',
                borderRadius: '12px',
                maxWidth: '80%',
                boxShadow: 'var(--shadow-sm)',
                border: isOwn ? 'none' : '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{m.text}</div>
                {m.documents && m.documents.length > 0 && (
                  <div style={{ marginTop: '8px', borderTop: isOwn ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)', paddingTop: '6px' }}>
                    {m.documents.map((d, idx) => (
                      <div key={idx} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <span>📄</span> <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>{m.time}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px' }}>
          <button onClick={() => send('Cum decurge procesul de evaluare?')} style={{ fontSize: '11px', padding: '6px 12px', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Cum decurge procesul?</button>
          <button onClick={() => send('Ați reușit să stabiliți o dată?')} style={{ fontSize: '11px', padding: '6px 12px', background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Ați stabilit data?</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {chatDocs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {chatDocs.map((d, i) => (
                  <span key={i} style={{ fontSize: '9px', background: 'var(--gold-faint, rgba(196,151,74,0.1))', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--gold-faint)' }}>
                    📄 {d} <span style={{ cursor: 'pointer', color: 'var(--error)' }} onClick={() => setChatDocs(p => p.filter((_, idx) => idx !== i))}>×</span>
                  </span>
                ))}
              </div>
            )}
            <textarea
              ref={textAreaRef}
              className="pm-input"
              style={{
                width: '100%',
                margin: 0,
                color: 'var(--ink)',
                background: 'var(--cream)',
                minHeight: '40px',
                maxHeight: '120px',
                resize: 'none',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-strong)',
                fontSize: '13px'
              }}
              placeholder="Scrieți un mesaj..."
              value={inputTitle}
              onChange={e => setInputTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(inputTitle);
                }
              }}
            />
          </div>
          <input
            type="file"
            multiple
            hidden
            ref={chatFileRef}
            onChange={e => {
              const files = Array.from(e.target.files || []);
              setChatDocs(prev => [...prev, ...files.map(f => f.name)]);
            }}
          />
          <button
            onClick={() => chatFileRef.current?.click()}
            style={{ width: '40px', height: '40px', background: 'var(--white)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-strong)', display: 'grid', placeItems: 'center', flexShrink: 0 }}
            title="Atașează document"
          >
            📎
          </button>
          <button
            className="pm-confirm-btn"
            style={{ width: 'auto', padding: '0 20px', height: '40px', margin: 0, whiteSpace: 'nowrap', borderRadius: '8px' }}
            onClick={() => send(inputTitle)}
          >
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
};

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { products: dbProducts, addEvalRequest, evalRequests, updateProduct, updateAuctionStatus, auctions: dbAuctions, addProduct } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [activeChatProduct, setActiveChatProduct] = useState<Product | null>(null);
  const [activeRequestProduct, setActiveRequestProduct] = useState<any | null>(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  if (!user || (user.role !== 'seller' && user.role !== 'admin')) return <Navigate to="/" replace />;

  const showToast = (msg: string) => { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  const combinedProducts = user?.id ? (dbProducts || []).filter(p => p.sellerId === user.id) : [];
  const mixedList = combinedProducts;

  const filtered = mixedList.filter((p: any) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter || p.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const launchAuction = (productId: number) => {
    const product = dbProducts.find(p => p.id === productId);
    if (product) {
      // 1. Update Product Status to LIVE
      updateProduct({ ...product, status: 'LIVE' });

      // 2. Update matching Auction status to active
      const auction = dbAuctions.find(a => a.productId === productId || a.title === product.title);
      if (auction) {
        updateAuctionStatus(auction.id, 'active');
        showToast(`✓ Auction launched! "${product.title}" is now live.`);
      } else {
        showToast('✓ Status updated to LIVE. (Auction link not found)');
      }
    }
  };

  return (
    <main className="seller-page">
      {/* Header */}
      <div className="seller-header">
        <div className="container seller-header__inner">
          <div>
            <span className="seller-header__eyebrow">Seller Dashboard</span>
            <h1 className="seller-header__title">My Products</h1>
            <p className="seller-header__sub">{mixedList.length} products · {mixedList.filter((p: any) => p.status?.toLowerCase() === 'live').length} live</p>
          </div>
          <button className="seller-add-btn" onClick={() => setShowAdd(true)}>+ Submit New Product</button>
        </div>
      </div>

      <div className="container seller-content">
        {/* Stats */}
        <div className="seller-stats">
          {[
            { label: 'Total Products', value: String(mixedList.length) },
            { label: 'Pending Review', value: String(mixedList.filter((p: any) => ['pending_review', 'PENDING', 'UNDER_REVIEW'].includes(p.status)).length) },
            { label: 'Live Now', value: String(mixedList.filter((p: any) => p.status?.toLowerCase() === 'live' || p.status === 'active').length) },
            { label: 'Total Sold', value: String(mixedList.filter((p: any) => p.status?.toLowerCase() === 'sold').length) },
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
              {filtered.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    <div className="seller-table__product">
                      <img src={p.images?.[0] || p.img} alt={p.title} className="seller-table__img" />
                      <div>
                        <div className="seller-table__title">{p.title}</div>
                        <div className="seller-table__date">{p.createdAt || p.submittedAt}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`seller-cat ${(p.category || 'Unknown').startsWith('Unknown') ? 'seller-cat--unknown' : 'seller-cat--known'}`}>
                      {p.category || 'Unknown'}
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
                    <span className={`seller-status seller-status--${p.status.toLowerCase()}`}>
                      {STATUS_LABELS[p.status] || STATUS_LABELS[p.status.toLowerCase()] || p.status}
                    </span>
                  </td>
                  <td>
                    <div className="seller-actions">
                      {(p.status === 'APPROVED' || p.status === 'approved') && (
                        <button className="seller-action-btn seller-action-btn--launch"
                          onClick={() => launchAuction(p.id)}>Launch →</button>
                      )}
                      {p.status === 'live' && (
                        <Link to={`/auctions/${p.id}`} className="seller-action-btn seller-action-btn--view">View Live</Link>
                      )}
                      {p.status === 'UNDER_REVIEW' && p.expertId && (
                        <button className="seller-action-btn seller-action-btn--edit"
                          onClick={() => setActiveChatProduct(p)}>Chat Expert</button>
                      )}
                      {(p.status === 'draft' || p.status === 'pending_review' || p.status === 'PENDING') && (
                        <>
                          <button className="seller-action-btn seller-action-btn--edit"
                            onClick={() => showToast('Edit form coming soon.')}>Edit</button>
                          {(() => {
                            const alreadySent = evalRequests.some(r => r.productId === p.id && r.status !== 'rejected');
                            return alreadySent ? (
                              <span style={{ fontSize: '11px', color: 'var(--sage)', fontWeight: 600 }}>✓ Requested</span>
                            ) : (
                              <button
                                className="seller-action-btn"
                                style={{ background: 'var(--ink)', color: 'white', border: 'none' }}
                                onClick={() => setActiveRequestProduct(p)}
                              >
                                📨 Request Eval
                              </button>
                            );
                          })()}
                        </>
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

      {showAdd && (
        <AddProductModal
          onClose={() => setShowAdd(false)}
          onAdd={(p: any) => {
            addProduct({ ...p, sellerId: user?.id || 0 });
            showToast('✓ Product submitted for expert review!');
          }}
        />
      )}
      {activeChatProduct && activeChatProduct.expertId && <ChatModal product={activeChatProduct} expertId={activeChatProduct.expertId} onClose={() => setActiveChatProduct(null)} />}
      {activeRequestProduct && (
        <RequestEvalModal
          product={activeRequestProduct}
          onClose={() => setActiveRequestProduct(null)}
          onSubmit={(message, docs) => {
            addEvalRequest({
              id: Date.now(),
              productId: activeRequestProduct.id,
              sellerId: user?.id || 103,
              message,
              documents: docs,
              sentAt: 'Just now',
              status: 'pending',
            });
            showToast('📨 Cerere de evaluare trimisă expertilor!');
          }}
        />
      )}
      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default SellerDashboard;