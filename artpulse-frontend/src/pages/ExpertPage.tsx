import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './ExpertPage.css';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
interface Product {
  id: number;
  title: string;
  artist: string;
  submittedBy: string;
  submittedAt: string;
  description: string;
  images: string[];
  category: 'Unknown' | string;
  suggestedPrice: number | null;
  expertOpinion: string;
  status: 'pending' | 'categorised' | 'rejected';
  documents: string[];
}

interface ChatMessage {
  from: 'expert' | 'seller';
  text: string;
  time: string;
}

type ChatMap = Record<number, ChatMessage[]>;

/* ══════════════════════════════════════════════════════════
   SELLER AUTO-REPLIES (simulated polling at 2s)
   ══════════════════════════════════════════════════════════ */
const SELLER_REPLIES = [
  'Thank you for looking at this! I can provide additional photos if needed.',
  'The artist has signed the work on the back. I can send a close-up photo.',
  'I purchased this directly from the gallery in 2021. I have the receipt.',
  'Yes, I can bring the work for in-person inspection if required.',
  'The provenance documents are all original. Shall I scan and send them?',
  'Happy to share more context about the condition — any specific concerns?',
  'The piece has never been restored or re-touched to my knowledge.',
];

let sellerReplyIdx = 0;
const getNextSellerReply = () => {
  const r = SELLER_REPLIES[sellerReplyIdx % SELLER_REPLIES.length];
  sellerReplyIdx++;
  return r;
};

/* ══════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════ */
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 101,
    title: 'Untitled (Red Series #3)',
    artist: 'Alexandru Popa',
    submittedBy: 'Seller User (ion.popescu)',
    submittedAt: '2 hours ago',
    description: 'Large-format work on paper using acrylics and collage elements. Red tones dominate. 150 × 100 cm. Created 2024. The work is accompanied by a letter from the artist and a gallery exhibition catalogue from 2023.',
    images: [
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    ],
    category: 'Unknown',
    suggestedPrice: null,
    expertOpinion: '',
    status: 'pending',
    documents: ['authenticity_letter.pdf', 'artist_cv.pdf', 'exhibition_catalogue_2023.pdf'],
  },
  {
    id: 102,
    title: 'Figura în Repaus',
    artist: 'Maria Ionescu',
    submittedBy: 'Seller User (maria.v)',
    submittedAt: '5 hours ago',
    description: 'Bronze cast sculpture, unique piece. Height 38 cm. Signed on base. Provenance: private collection, Bucharest, acquired 2018. Accompanied by foundry certificate and artist COA.',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80',
    ],
    category: 'Unknown',
    suggestedPrice: null,
    expertOpinion: '',
    status: 'pending',
    documents: ['provenance_letter.pdf', 'foundry_certificate.pdf'],
  },
  {
    id: 103,
    title: 'Peisaj de Iarnă',
    artist: 'Ion Grigorescu',
    submittedBy: 'Seller User (g.seller)',
    submittedAt: '1 day ago',
    description: 'Oil on canvas, 80 × 60 cm. Depicting a winter landscape in Transylvania. Early 2000s. Good condition, minor craquelure consistent with age. Previously exhibited at Galeria Națională 2005.',
    images: ['https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&q=80'],
    category: 'Unknown',
    suggestedPrice: null,
    expertOpinion: '',
    status: 'pending',
    documents: ['expert_appraisal_2019.pdf', 'exhibition_record.pdf'],
  },
];

const CATEGORY_OPTIONS = [
  'Painting', 'Sculpture', 'Photography', 'Drawing',
  'Mixed Media', 'Print', 'Ceramics', 'Textile Art',
  'Digital Art', 'Installation',
];

const INITIAL_CHATS: ChatMap = {
  101: [
    { from: 'seller', text: 'Hello! I submitted this work. Please let me know if you need anything else from my side.', time: '09:15' },
  ],
  102: [
    { from: 'seller', text: 'Hi, the sculpture is available for in-person viewing in Bucharest if needed.', time: '08:30' },
    { from: 'expert', text: 'Thank you — I will review the documentation first. I may ask to inspect in person.', time: '08:45' },
  ],
  103: [],
};

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
const ExpertPage: React.FC = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selected, setSelected] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [imgIdx, setImgIdx] = useState(0);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [opinion, setOpinion] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Sediu ArtPulse');
  const [chatInput, setChatInput] = useState('');
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'docs' | 'chat'>('info');
  const [mainView, setMainView] = useState<'queue' | 'calendar'>('queue');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage, addAppointment, appointments } = useData();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selected]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3200);
  }, []);

  if (!user || (user.role !== 'expert' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  /* ── Select product ── */
  const selectProduct = (p: Product) => {
    setSelected(p);
    setImgIdx(0);
    setCategory('');
    setNewCategory('');
    setSuggestedPrice('');
    setOpinion('');
  };

  /* ── Send chat message ── */
  const sendChat = () => {
    if (!chatInput.trim() || !selected || !user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Convert 101 IDs to DataContext IDs. Seller 1 is 103, Expert 1 is 101, Prod is 51
    const sellerId = selected.id === 101 ? 103 : 104;
    const realProdId = selected.id === 101 ? 51 : 52;
    
    addMessage({ id: Date.now(), productId: realProdId, fromId: user.id || 0, toId: sellerId, text: chatInput.trim(), time });
    setChatInput('');
  };

  /* ── Categorise ── */
  const categorise = () => {
    const finalCat = newCategory.trim() || category;
    if (!finalCat) { showToast('Please select or create a category first.'); return; }
    if (!selected) return;

    const price = suggestedPrice ? Number(suggestedPrice) : null;
    const updated: Product = {
      ...selected,
      category: finalCat,
      suggestedPrice: price,
      expertOpinion: opinion,
      status: 'categorised',
    };
    setProducts(prev => prev.map(p => p.id === selected.id ? updated : p));
    setSelected(updated);
    showToast(`✓ "${selected.title}" categorised as ${finalCat}. Seller can now launch.`);
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const sellerId = selected.id === 101 ? 103 : 104;
    const realProdId = selected.id === 101 ? 51 : 52;
    
    addMessage({ id: Date.now() + 5, productId: realProdId, fromId: user.id || 0, toId: sellerId, text: `✅ I have categorised your work as "${finalCat}". ${price ? `Suggested starting price: €${price.toLocaleString()}.` : ''} You may now launch the auction from your Seller Dashboard.`, time });
  };

  const doSchedule = () => {
    if (!scheduleDate || !selected || !user) return;
    const sellerId = selected.id === 101 ? 103 : 104;
    const realProdId = selected.id === 101 ? 51 : 52;
    addAppointment({ id: Date.now(), productId: realProdId, expertId: user.id || 0, sellerId, date: new Date(scheduleDate).toISOString(), location: scheduleLocation, status: 'SCHEDULED', notes: '' });
    
    const time = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
    addMessage({ id: Date.now() + 2, productId: realProdId, fromId: user.id || 0, toId: sellerId, text: `Am stabilit o întâlnire fizică pentru data de ${new Date(scheduleDate).toLocaleDateString()}, locația: ${scheduleLocation}. Vă rog să fiți prezent cu lucrarea.`, time });
    
    showToast('Intalnirea a fost adaugata in calendar si sellerul notificat.');
    setScheduleDate('');
  };

  /* ── Reject ── */
  const reject = () => {
    if (!selected) return;
    if (!window.confirm('Reject this submission? The seller will be notified.')) return;
    setProducts(prev => prev.map(p => p.id === selected.id ? { ...p, status: 'rejected' } : p));
    setSelected(prev => prev ? { ...prev, status: 'rejected' } : null);
    showToast(`Submission rejected. Seller notified.`);
  };

  const pending = products.filter(p => p.status === 'pending');
  const done    = products.filter(p => p.status !== 'pending');
  const realProdId = selected?.id === 101 ? 51 : 52;
  const currentChatMsgs = selected ? messages.filter(m => m.productId === realProdId) : [];

  return (
    <main className="expert-page">
      {/* Header */}
      <section className="expert-header">
        <div className="container expert-header__inner">
          <div>
            <span className="expert-header__eyebrow">Expert Evaluator</span>
            <h1 className="expert-header__title">Product Review Queue</h1>
            <p className="expert-header__sub">
              {pending.length} pending · {done.filter(p => p.status === 'categorised').length} categorised · {done.filter(p => p.status === 'rejected').length} rejected
            </p>
          </div>
          <div className="expert-header__polling-badge" style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setMainView('queue')} 
              style={{ background: mainView === 'queue' ? 'var(--ink)' : 'transparent', color: mainView === 'queue' ? 'white' : 'var(--ink)', border: '1px solid var(--ink)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Queue
            </button>
            <button 
              onClick={() => setMainView('calendar')} 
              style={{ background: mainView === 'calendar' ? 'var(--ink)' : 'transparent', color: mainView === 'calendar' ? 'white' : 'var(--ink)', border: '1px solid var(--ink)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              📅 My Calendar
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
              <img src={p.images[0]} alt={p.title} className="expert-list__thumb" />
              <div className="expert-list__info">
                <div className="expert-list__title">{p.title}</div>
                <div className="expert-list__sub">{p.artist} · {p.submittedAt}</div>
                <span className="expert-list__cat expert-list__cat--unknown">Unknown</span>
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
                  <img src={p.images[0]} alt={p.title} className="expert-list__thumb" />
                  <div className="expert-list__info">
                    <div className="expert-list__title">{p.title}</div>
                    <span className={`expert-list__cat ${p.status === 'categorised' ? 'expert-list__cat--known' : 'expert-list__cat--rejected'}`}>
                      {p.status === 'categorised' ? p.category : 'Rejected'}
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
              <div className={`expert-img-status expert-img-status--${selected.status}`}>
                {selected.status === 'pending' ? '⏳ Pending Review'
                  : selected.status === 'categorised' ? `✓ ${selected.category}`
                  : '✕ Rejected'}
              </div>
            </div>

            {/* Tabs */}
            <div className="expert-tabs">
              {(['info', 'docs', 'chat'] as const).map(t => (
                <button
                  key={t}
                  className={`expert-tab ${activeTab === t ? 'expert-tab--active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t === 'info' ? '📋 Info & Categorise'
                    : t === 'docs' ? `📎 Documents (${selected.documents.length})`
                    : `💬 Chat with Seller${currentChatMsgs.length > 0 ? ` (${currentChatMsgs.length})` : ''}`}
                </button>
              ))}
            </div>

            {/* ── TAB: Info & Categorise ── */}
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

                {selected.status === 'pending' && (
                  <div className="expert-form">
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

                    <h3 className="expert-form__heading" style={{ marginTop: '30px' }}>Schedule Physical Evaluation</h3>
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
                )}

                {selected.status === 'categorised' && (
                  <div className="expert-result">
                    <div className="expert-result__row">
                      <span className="expert-result__label">Category</span>
                      <span className="expert-result__value expert-result__value--cat">{selected.category}</span>
                    </div>
                    {selected.suggestedPrice && (
                      <div className="expert-result__row">
                        <span className="expert-result__label">Suggested Price</span>
                        <span className="expert-result__value">€{selected.suggestedPrice.toLocaleString()}</span>
                      </div>
                    )}
                    {selected.expertOpinion && (
                      <div className="expert-result__row expert-result__row--full">
                        <span className="expert-result__label">Expert Opinion</span>
                        <p className="expert-result__opinion">{selected.expertOpinion}</p>
                      </div>
                    )}
                    <div className="expert-result__note">
                      ✓ Seller has been notified and may now launch the auction.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: Documents ── */}
            {activeTab === 'docs' && (
              <div className="expert-docs">
                <h3 className="expert-docs__heading">Submitted Documents</h3>
                <p className="expert-docs__sub">Review these before categorising the work.</p>
                {selected.documents.map((doc, i) => (
                  <div key={i} className="expert-doc-item">
                    <span className="expert-doc-icon">📄</span>
                    <div className="expert-doc-info">
                      <div className="expert-doc-name">{doc}</div>
                      <div className="expert-doc-type">{doc.endsWith('.pdf') ? 'PDF Document' : 'Image'}</div>
                    </div>
                    <button className="expert-doc-view" onClick={() => showToast(`Opening ${doc} — demo only.`)}>
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
                      className={`expert-chat__msg ${isOwn ? 'expert-chat__msg--own' : ''}`}
                    >
                      <div className={`expert-chat__bubble ${isOwn ? 'expert-chat__bubble--expert' : 'expert-chat__bubble--seller'}`}>
                        {msg.text}
                      </div>
                      <div className="expert-chat__time">
                        {isOwn ? 'You' : 'Seller'} · {msg.time}
                      </div>
                    </div>
                  )})}
                  <div ref={chatEndRef} />
                </div>

                <div className="expert-chat__input-row">
                  <input
                    className="expert-chat__input"
                    type="text"
                    placeholder="Message the seller…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  />
                  <button
                    className="expert-chat__send"
                    onClick={sendChat}
                    disabled={!chatInput.trim()}
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

      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default ExpertPage;