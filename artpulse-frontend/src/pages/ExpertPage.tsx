import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './ExpertPage.css';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
// Using global Product from DataContext

const CATEGORY_OPTIONS = [
  'Painting', 'Sculpture', 'Photography', 'Drawing',
  'Mixed Media', 'Print', 'Ceramics', 'Textile Art',
  'Digital Art', 'Installation',
];

const ExpertPage: React.FC = () => {
  const { user } = useAuth();
  const { messages, addMessage, addAppointment, appointments, products, users, updateProduct, evalRequests, updateEvalRequest } = useData();

  const expertProducts = (products || []).filter(p => !user || user.role === 'admin' || p.expertId === user.id || p.status === 'PENDING');

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (selectedId === null && expertProducts.length > 0) {
      setSelectedId(expertProducts[0].id);
    }
  }, [expertProducts, selectedId]);

  const selected = products?.find(p => p.id === selectedId) || null;
  const [imgIdx, setImgIdx] = useState(0);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [opinion, setOpinion] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Sediu ArtPulse');
  const [chatInput, setChatInput] = useState('');
  const [chatDocs, setChatDocs] = useState<string[]>([]);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'categorise' | 'docs' | 'chat'>('info');
  const [mainView, setMainView] = useState<'queue' | 'calendar' | 'requests'>('queue');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const newHeight = Math.min(textAreaRef.current.scrollHeight, 100);
      textAreaRef.current.style.height = `${newHeight}px`;
    }
  }, [chatInput]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, selected, activeTab]);

  useEffect(() => {
    if (activeTab !== 'info') {
      tabsRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [activeTab]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  }, []);

  if (!user || (user.role !== 'expert' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  const selectProduct = (p: any) => {
    setSelectedId(p.id);
    setImgIdx(0);
    setCategory('');
    setNewCategory('');
    setSuggestedPrice('');
    setOpinion('');
  };

  const sendChat = () => {
    if ((!chatInput.trim() && chatDocs.length === 0) || !selected || !user) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const owner = users.find(u => u.id === selected.sellerId);
    const toId = owner?.id || 103; // fallback to Seller 1

    addMessage({
      id: Date.now(),
      productId: selected.id,
      fromId: user.id || 0,
      toId,
      text: chatInput.trim(),
      time,
      documents: chatDocs
    });

    if (chatDocs.length > 0) {
      const existingDocs = selected.documents || [];
      const updatedDocs = Array.from(new Set([...existingDocs, ...chatDocs]));
      updateProduct({ ...selected, documents: updatedDocs });
    }

    setChatInput('');
    setChatDocs([]);
  };

  const categorise = () => {
    const finalCat = newCategory.trim() || category;
    if (!finalCat) { showToast('Please select or create a category first.'); return; }
    if (!selected) return;

    const price = suggestedPrice ? Number(suggestedPrice) : null;
    const updated: any = {
      ...selected,
      category: finalCat,
      suggestedPrice: price,
      expertOpinion: opinion,
      status: 'APPROVED',
    };
    updateProduct(updated);
    showToast(`✓ "${selected.title}" categorised as ${finalCat}. Seller can now launch.`);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const sellerId = selected.sellerId;
    const realProdId = selected.id;

    addMessage({ id: Date.now() + 5, productId: realProdId, fromId: user.id || 0, toId: sellerId, text: `✅ I have approved your work as "${finalCat}". ${price ? `Suggested starting price: €${price.toLocaleString()}.` : ''} You may now launch the auction from your Seller Dashboard.`, time });
  };

  const doSchedule = () => {
    if (!scheduleDate || !selected || !user) return;
    const sellerId = selected.sellerId;
    const realProdId = selected.id;
    addAppointment({ id: Date.now(), productId: realProdId, expertId: user.id || 0, sellerId, date: new Date(scheduleDate).toISOString(), location: scheduleLocation, status: 'SCHEDULED', notes: '' });

    const time = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    addMessage({ id: Date.now() + 2, productId: realProdId, fromId: user.id || 0, toId: sellerId, text: `Bună, evaluarea a fost programată pentru data de ${new Date(scheduleDate).toLocaleDateString()} la adresa ${scheduleLocation}. Te aștept!`, time });

    showToast('Intalnirea a fost adaugata in calendar si sellerul notificat.');
    setScheduleDate('');
  };

  const reject = () => {
    if (!selected) return;
    if (!window.confirm('Reject this submission? The seller will be notified.')) return;
    updateProduct({ ...selected, status: 'REJECTED' });
    showToast(`Submission rejected. Seller notified.`);
  };

  const pending = (products || []).filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  const done = (products || []).filter(p => p.status !== 'PENDING' && p.status !== 'UNDER_REVIEW');
  const currentChatMsgs = (selected && messages) ? messages.filter(m => m.productId === selected.id) : [];

  return (
    <main className="expert-page">
      {/* Header */}
      <section className="expert-header">
        <div className="container expert-header__inner">
          <div>
            <span className="expert-header__eyebrow">Expert Evaluator</span>
            <h1 className="expert-header__title">Product Review Queue</h1>
            <p className="expert-header__sub">
              {pending.length} pending · {done.filter(p => p.status === 'APPROVED').length} categorised · {done.filter(p => p.status === 'REJECTED').length} rejected
            </p>
          </div>
          <div className="expert-header__polling-badge" style={{ display: 'flex', gap: '8px', border: '1px solid var(--cream)', padding: '6px', borderRadius: '8px', background: 'rgba(247, 244, 239, 0.05)' }}>
            <button
              onClick={() => setMainView('queue')}
              style={{ background: mainView === 'queue' ? 'var(--gold)' : 'transparent', color: mainView === 'queue' ? 'white' : 'var(--cream)', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              Queue
            </button>
            <button
              onClick={() => setMainView('calendar')}
              style={{ background: mainView === 'calendar' ? 'var(--gold)' : 'transparent', color: mainView === 'calendar' ? 'white' : 'var(--cream)', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
              🗓 My Schedule
            </button>
            <button
              onClick={() => setMainView('requests')}
              style={{ background: mainView === 'requests' ? '#c47a3a' : 'transparent', color: mainView === 'requests' ? 'white' : 'var(--cream)', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, position: 'relative' }}>
              📨 Requests
              {evalRequests.filter(r => r.status === 'pending').length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#e53e3e', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {evalRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {mainView === 'calendar' ? (
        <div className="container" style={{ padding: '40px 0' }}>
          <h2>My Scheduled Appointments</h2>
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--cream)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Location</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.filter(a => a.expertId === user?.id).map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(a.date).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>Product #{a.productId}</td>
                  <td style={{ padding: '12px' }}>{a.location}</td>
                  <td style={{ padding: '12px' }}>{a.status}</td>
                </tr>
              ))}
              {appointments.filter(a => a.expertId === user?.id).length === 0 && (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No appointments scheduled.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : mainView === 'requests' ? (
        <div className="container" style={{ padding: '40px 0' }}>
          <h2 style={{ marginBottom: '8px' }}>Evaluation Requests</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '14px', marginBottom: '24px' }}>Sellers are requesting expert evaluation for their artworks. Only you can accept a request — once accepted by any expert, it disappears for the rest.</p>
          {evalRequests.filter(r => {
            if (r.status !== 'pending') return false;
            if (r.acceptedByExpertId && r.acceptedByExpertId !== user?.id) return false;
            return true;
          }).length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--ink-muted)', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <div>No pending evaluation requests at this time.</div>
              </div>
            )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {evalRequests.filter(r => r.status === 'pending' && (!r.acceptedByExpertId || r.acceptedByExpertId === user?.id)).map(req => {
              const product = products.find(p => p.id === req.productId);
              const seller = users.find(u => u.id === req.sellerId);
              return (
                <div key={req.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                  {product && <img src={product.images[0]} alt={product.title} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{product?.title || `Product #${req.productId}`}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-muted)', marginBottom: '10px' }}>From: <strong>{seller?.name || 'Unknown Seller'}</strong> · Sent: {req.sentAt}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink)', background: 'var(--cream)', padding: '10px 14px', borderRadius: '6px', marginBottom: '10px', lineHeight: 1.5 }}>
                      "{req.message}"
                    </div>
                    {req.documents.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--ink-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600 }}>📎 Documents:</span>
                        {req.documents.map((doc, i) => (
                          <span key={i} style={{ background: 'var(--parchment)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>{doc}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        updateEvalRequest({ ...req, status: 'accepted', acceptedByExpertId: user?.id || 0 });
                        if (product) updateProduct({ ...product, status: 'UNDER_REVIEW', expertId: user?.id || 0 });
                        const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        if (product && user) addMessage({ id: Date.now(), productId: req.productId, fromId: user.id || 0, toId: req.sellerId, text: `✅ Am acceptat cererea ta de evaluare pentru "${product.title}". Te voi contacta în curând pentru a stabili detaliile.`, time });
                        showToast('✓ Cerere acceptată! Produsul a fost atribuit ție.');
                        setMainView('queue');
                      }}
                      style={{ background: 'var(--sage, #4a6741)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => {
                        updateEvalRequest({ ...req, status: 'rejected' });
                        showToast('Cerere refuzată.');
                      }}
                      style={{ background: 'transparent', color: 'var(--rust, #8b3a2a)', border: '1px solid var(--rust, #8b3a2a)', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                    >
                      ✕ Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accepted/Declined history */}
          {evalRequests.filter(r => r.status !== 'pending').length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '14px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '12px' }}>History</h3>
              {evalRequests.filter(r => r.status !== 'pending').map(req => {
                const product = products.find(p => p.id === req.productId);
                return (
                  <div key={req.id} style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', opacity: 0.7 }}>
                    <span style={{ fontWeight: 600 }}>{product?.title || `Product #${req.productId}`}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: req.status === 'accepted' ? 'var(--sage)' : 'var(--rust)', background: req.status === 'accepted' ? 'rgba(74,103,65,.1)' : 'rgba(139,58,42,.1)', padding: '3px 10px', borderRadius: '4px' }}>
                      {req.status === 'accepted' ? '✓ Accepted' : '✕ Declined'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="expert-layout container">

          {/* ── LEFT: Product list ── */}
          <aside className="expert-list">
            <h2 className="expert-list__heading">Pending Review</h2>
            {pending.length === 0 && (
              <div className="expert-list__empty">All submissions reviewed ✓</div>
            )}
            {pending.map(p => (
              <button
                key={p.id}
                className={`expert-list__item ${selected?.id === p.id ? 'expert-list__item--active' : ''}`}
                onClick={() => selectProduct(p)}
              >
                <img src={(p.images && p.images[0]) || 'https://via.placeholder.com/150'} alt={p.title} className="expert-list__thumb" />
                <div className="expert-list__info">
                  <div className="expert-list__title">{p.title}</div>
                  <div className="expert-list__sub">Lot #{p.id} · {p.artist || 'Unknown'}</div>
                  <div className="expert-list__extra" style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{p.submittedAt}</span>
                    <span>📎 {(p.documents || []).length} docs</span>
                  </div>
                </div>
              </button>
            ))}

            {done.length > 0 && (
              <>
                <h2 className="expert-list__heading expert-list__heading--done">Reviewed</h2>
                {done.map(p => (
                  <button
                    key={p.id}
                    className={`expert-list__item ${selected?.id === p.id ? 'expert-list__item--active' : ''} expert-list__item--done`}
                    onClick={() => selectProduct(p)}
                  >
                    <img src={(p.images && p.images[0]) || 'https://via.placeholder.com/150'} alt={p.title} className="expert-list__thumb" />
                    <div className="expert-list__info">
                      <div className="expert-list__title">{p.title}</div>
                      <span className={`expert-list__cat ${p.status === 'APPROVED' || p.status === 'active' || p.status === 'upcoming' || p.status === 'sold'
                          ? 'expert-list__cat--known'
                          : 'expert-list__cat--rejected'
                        }`} style={{
                          color: p.status === 'APPROVED' || p.status === 'active' || p.status === 'upcoming' || p.status === 'sold' ? 'var(--sage, #4a6741)' : 'var(--rust, #8b3a2a)'
                        }}>
                        {p.status === 'APPROVED' || p.status === 'active' || p.status === 'sold' || p.status === 'upcoming'
                          ? `✓ ${p.category || 'Approved'}`
                          : '✕ Rejected'}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </aside>

          {/* ── RIGHT: Detail panel ── */}
          {selected ? (
            <div className="expert-detail">

              {/* Image viewer */}
              <div className="expert-img-viewer">
                <img src={selected.images[imgIdx]} alt={selected.title} className="expert-img-main" />
                {selected.images.length > 1 && (
                  <div className="expert-img-thumbs">
                    {selected.images.map((src, i) => (
                      <button
                        key={i}
                        className={`expert-img-thumb ${i === imgIdx ? 'expert-img-thumb--active' : ''}`}
                        onClick={() => setImgIdx(i)}
                      >
                        <img src={src} alt={`View ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
                <div className={`expert-img-status expert-img-status--${selected.status.toLowerCase()}`}>
                  {selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW' ? '⏳ Pending Review'
                    : selected.status === 'APPROVED' || selected.status === 'active' || selected.status === 'sold' || selected.status === 'upcoming' ? `✓ ${selected.category}`
                      : '✕ Rejected'}
                </div>
              </div>

              {/* Tabs */}
              <div className="expert-tabs" ref={tabsRef}>
                {(['info', 'schedule', 'categorise', 'docs', 'chat'] as const).map(t => (
                  <button
                    key={t}
                    className={`expert-tab ${activeTab === t ? 'expert-tab--active' : ''}`}
                    onClick={() => setActiveTab(t)}
                    style={{ padding: '14px 6px', fontSize: '12.5px' }}
                  >
                    {t === 'info' ? 'ℹ Info'
                      : t === 'schedule' ? '📅 Schedule Eval'
                        : t === 'categorise' ? '✒ Categorise Work'
                          : t === 'docs' ? `📎 Documents (${(selected?.documents || []).length})`
                            : `💬 Chat with Seller${(currentChatMsgs || []).length > 0 ? ` (${currentChatMsgs.length})` : ''}`}
                  </button>
                ))}
              </div>

              {/* ── TAB: Info ── */}
              {activeTab === 'info' && (
                <div className="expert-info">
                  <div className="expert-info__header">
                    <h2 className="expert-info__title">{selected.title}</h2>
                    <div className="expert-info__meta">
                      <span>{selected.artist}</span>
                      <span>·</span>
                      <span>Submitted by: <strong>{selected.submittedBy}</strong></span>
                      <span>·</span>
                      <span>{selected.submittedAt}</span>
                    </div>
                  </div>
                  <p className="expert-info__desc">{selected.description}</p>
                </div>
              )}

              {/* ── TAB: Schedule Evaluation ── */}
              {activeTab === 'schedule' && (
                <div className="expert-info">
                  {(selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW') ? (
                    <div className="expert-form" style={{ marginTop: 0 }}>
                      <h3 className="expert-form__heading">Schedule Physical Evaluation</h3>
                      <div className="expert-form__row">
                        <div className="expert-form__field">
                          <label className="expert-form__label">Date & Time</label>
                          <input type="datetime-local" className="expert-form__input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                        </div>
                        <div className="expert-form__field">
                          <label className="expert-form__label">Location</label>
                          <input type="text" className="expert-form__input" value={scheduleLocation} onChange={e => setScheduleLocation(e.target.value)} />
                        </div>
                      </div>
                      <button className="expert-form__approve" style={{ background: 'var(--ink)' }} onClick={doSchedule}>📅 Add to Calendar & Notify</button>
                    </div>
                  ) : (
                    <div className="expert-detail--empty">Evaluation already completed or not required.</div>
                  )}
                </div>
              )}

              {/* ── TAB: Categorise Work ── */}
              {activeTab === 'categorise' && (
                <div className="expert-info">
                  {selected.status === 'PENDING' || selected.status === 'UNDER_REVIEW' ? (
                    <div className="expert-form" style={{ marginTop: 0 }}>
                      <h3 className="expert-form__heading">Categorise This Work</h3>
                      <div className="expert-form__row">
                        <div className="expert-form__field">
                          <label className="expert-form__label">Select Category</label>
                          <select
                            className="expert-form__select"
                            value={category}
                            onChange={e => { setCategory(e.target.value); setNewCategory(''); }}
                          >
                            <option value="">— Choose existing —</option>
                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="expert-form__field">
                          <label className="expert-form__label">Or Create New Category</label>
                          <input
                            className="expert-form__input"
                            placeholder="e.g. Watercolour"
                            value={newCategory}
                            onChange={e => { setNewCategory(e.target.value); setCategory(''); }}
                          />
                        </div>
                      </div>

                      <div className="expert-form__field">
                        <label className="expert-form__label">Suggested Starting Price (€)</label>
                        <input
                          type="number"
                          className="expert-form__input"
                          placeholder="e.g. 1200"
                          value={suggestedPrice}
                          onChange={e => setSuggestedPrice(e.target.value)}
                        />
                        <span className="expert-form__hint">Visible to Seller only — not binding.</span>
                      </div>

                      <div className="expert-form__field">
                        <label className="expert-form__label">Expert Opinion / Notes for Seller</label>
                        <textarea
                          className="expert-form__textarea"
                          placeholder="Condition notes, authentication remarks, market positioning…"
                          value={opinion}
                          onChange={e => setOpinion(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="expert-form__actions">
                        <button className="expert-form__approve" onClick={categorise}>
                          ✓ Categorise &amp; Approve
                        </button>
                        <button className="expert-form__reject" onClick={reject}>
                          ✕ Reject Submission
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="expert-result">
                      <h3 className="expert-docs__heading" style={{ marginBottom: '16px' }}>Evaluation Result</h3>
                      <div className="expert-result__row">
                        <span className="expert-result__label">Status</span>
                        <span className="expert-result__value" style={{ color: selected.status === 'APPROVED' || selected.status === 'active' || selected.status === 'upcoming' || selected.status === 'sold' ? 'var(--sage)' : 'var(--rust)' }}>
                          {selected.status === 'APPROVED' || selected.status === 'active' || selected.status === 'upcoming' || selected.status === 'sold' ? 'Approved' : 'Rejected'}
                        </span>
                      </div>
                      {(selected.status === 'APPROVED' || selected.status === 'active' || selected.status === 'upcoming' || selected.status === 'sold') && (
                        <>
                          <div className="expert-result__row">
                            <span className="expert-result__label">Category</span>
                            <span className="expert-result__value expert-result__value--cat">{selected.category}</span>
                          </div>
                          <div className="expert-result__row">
                            <span className="expert-result__label">Suggested Price</span>
                            <span className="expert-result__value">€{selected.suggestedPrice?.toLocaleString() || 'N/A'}</span>
                          </div>
                          {selected.expertOpinion && (
                            <div className="expert-result__row expert-result__row--full">
                              <span className="expert-result__label">Expert Notes</span>
                              <div className="expert-result__opinion">{selected.expertOpinion}</div>
                            </div>
                          )}
                          <div className="expert-result__note">✓ Seller has been notified and can launch the auction.</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Documents ── */}
              {activeTab === 'docs' && (
                <div className="expert-docs">
                  <h3 className="expert-docs__heading">Submitted Documents</h3>
                  <p className="expert-docs__sub">Review these before categorising the work.</p>
                  {(selected.documents || []).map((doc, i) => (
                    <div key={i} className="expert-doc-item">
                      <span className="expert-doc-icon">📄</span>
                      <div className="expert-doc-info">
                        <div className="expert-doc-name">{doc}</div>
                        <div className="expert-doc-type">{doc.endsWith('.pdf') ? 'PDF Document' : 'Image'}</div>
                      </div>
                      <button className="expert-doc-view" onClick={() => setPreviewDoc(doc)}>
                        View →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB: Chat ── */}
              {activeTab === 'chat' && (
                <div className="expert-chat">
                  <div className="expert-chat__header">
                    <h3 className="expert-chat__title">Chat with Seller via DataContext</h3>
                  </div>

                  <div className="expert-chat__messages" role="log" aria-live="polite">
                    {currentChatMsgs.length === 0 && (
                      <div className="expert-chat__empty">No messages yet. Start the conversation.</div>
                    )}
                    {currentChatMsgs.map((msg, i) => {
                      const isOwn = msg.fromId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`expert-chat__msg ${isOwn ? 'expert-chat__msg--own' : 'expert-chat__msg--other'}`}
                        >
                          <div className={`expert-chat__bubble ${isOwn ? 'expert-chat__bubble--expert' : 'expert-chat__bubble--seller'}`}>
                            <div className="expert-chat__text">{msg.text}</div>
                            {msg.documents && msg.documents.length > 0 && (
                              <div className="expert-chat__docs">
                                {msg.documents.map((d, idx) => (
                                  <div key={idx} className="expert-chat__doc" onClick={() => setPreviewDoc(d)}>
                                    <span>📄</span> <span className="expert-chat__doc-name">{d}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="expert-chat__time">
                              {isOwn ? 'You' : 'Seller'} · {msg.time}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="expert-chat__input-row" style={{ alignItems: 'flex-end', gap: '10px' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {chatDocs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                          {chatDocs.map((d, i) => (
                            <span key={i} style={{ fontSize: '10px', background: 'var(--ink-faint)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {d} <span style={{ cursor: 'pointer', color: 'var(--error)' }} onClick={() => setChatDocs(p => p.filter((_, idx) => idx !== i))}>×</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <textarea
                        ref={textAreaRef}
                        className="expert-chat__input"
                        placeholder="Message the seller…"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendChat();
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border-strong)',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          outline: 'none',
                          resize: 'none',
                          minHeight: '40px',
                          maxHeight: '100px',
                          lineHeight: '1.4',
                          overflowY: 'auto'
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
                      style={{ background: 'var(--cream-dark)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '10px', cursor: 'pointer', height: '40px', display: 'flex', alignItems: 'center' }}
                      title="Atașează document"
                    >
                      📎
                    </button>
                    <button
                      className="expert-chat__send"
                      onClick={sendChat}
                      disabled={!chatInput.trim() && chatDocs.length === 0}
                      style={{ height: '40px', display: 'flex', alignItems: 'center', marginBottom: '2px' }}
                    >↑</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="expert-detail expert-detail--empty">
              <p>Select a submission from the list to begin review.</p>
            </div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="expert-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="expert-modal" onClick={e => e.stopPropagation()}>
            <div className="expert-modal__header">
              <h3>Preview: {previewDoc}</h3>
              <button className="expert-modal__close" onClick={() => setPreviewDoc(null)}>✕</button>
            </div>
            <div className="expert-modal__body" style={{ padding: '30px', background: '#fcfcfc', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '2px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'serif' }}>ARTPULSE AUTHENTICATION</span>
                <span style={{ fontSize: '12px' }}>DOC_ID: {Math.floor(Math.random() * 900000 + 100000)}</span>
              </div>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📜</div>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Simulated Document Content</h4>
                <p style={{ color: '#666', maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: '1.6' }}>
                  This is a simulated preview of <strong>{previewDoc}</strong>. In a production environment, this would render the actual PDF or image stored on the server.
                </p>
              </div>
              <div style={{ marginTop: 'auto', padding: '20px', background: '#eee', borderRadius: '8px', fontSize: '11px', color: '#777' }}>
                Digital signature verified: 2026-04-14 13:10:42.
                Hash: 0x72a...f92
              </div>
            </div>
            <div className="expert-modal__footer" style={{ padding: '15px', borderTop: '1px solid #eee', textAlign: 'right' }}>
              <button className="expert-form__reject" style={{ padding: '8px 20px', background: 'var(--ink)' }} onClick={() => setPreviewDoc(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default ExpertPage;