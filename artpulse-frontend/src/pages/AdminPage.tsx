import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './AdminPage.css';

/* ══════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════ */
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'guest' | 'bidder' | 'seller' | 'expert' | 'admin';
  joined: string;
  bids: number;
  spent: number;
  status: 'active' | 'suspended' | 'deleted'; // deleted = soft-deleted
  deletedAt?: string;
}

interface AdminAuction {
  id: number;
  title: string;
  artist: string;
  category: string;
  bid: number;
  bids: number;
  status: 'active' | 'upcoming' | 'ended' | 'unknown';
  ends: string;
  sellerName: string;
}

interface AuditEntry {
  id: number;
  timestamp: string;
  adminName: string;
  action: string;
  target: string;
  detail: string;
}

type AdminTab = 'overview' | 'users' | 'auctions' | 'audit' | 'calendars';

/* ══════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════ */
const MOCK_USERS: AdminUser[] = [
  { id: 1, name: 'Ion Popescu',   email: 'ion@example.com',   role: 'bidder',  joined: 'Jan 2026', bids: 24, spent: 6200,  status: 'active' },
  { id: 2, name: 'Maria Vasile',  email: 'maria@example.com', role: 'seller',  joined: 'Feb 2026', bids: 11, spent: 2800,  status: 'active' },
  { id: 3, name: 'Alex Chen',     email: 'alex@example.com',  role: 'bidder',  joined: 'Mar 2026', bids: 3,  spent: 420,   status: 'suspended' },
  { id: 4, name: 'Elena Savu',    email: 'elena@example.com', role: 'expert',  joined: 'Mar 2026', bids: 0,  spent: 0,     status: 'active' },
  { id: 5, name: 'Demo Admin',    email: 'admin@example.com', role: 'admin',   joined: 'Jan 2026', bids: 0,  spent: 0,     status: 'active' },
  { id: 6, name: 'Radu Marin',    email: 'radu@example.com',  role: 'seller',  joined: 'Feb 2026', bids: 0,  spent: 0,     status: 'deleted', deletedAt: '15 Mar 2026' },
];

const MOCK_AUCTIONS: AdminAuction[] = [
  { id: 1, title: 'Lumière dorée',    artist: 'Marie Leblanc',  category: 'Painting',    bid: 4200, bids: 18, status: 'active',   ends: '2h 14m',        sellerName: 'Maria Vasile' },
  { id: 2, title: 'Silent Forms',     artist: 'Kenji Watanabe', category: 'Sculpture',   bid: 8750, bids: 31, status: 'active',   ends: '5h 33m',        sellerName: 'Maria Vasile' },
  { id: 3, title: 'Urban Abstraction',artist: 'Sofia Petrov',   category: 'Photography', bid: 1900, bids: 7,  status: 'active',   ends: '11h 05m',       sellerName: 'Ion Popescu' },
  { id: 4, title: 'Golden Hour Series',artist: 'Ama Diallo',    category: 'Painting',    bid: 3100, bids: 0,  status: 'upcoming', ends: 'Starts in 24h', sellerName: 'Maria Vasile' },
  { id: 8, title: 'Fragile Geometry', artist: 'Ines Moreau',    category: 'Mixed Media', bid: 1450, bids: 14, status: 'active',   ends: '1h 45m',        sellerName: 'Ion Popescu' },
  { id: 101, title: 'Untitled (Red Series #3)', artist: 'Alexandru Popa', category: 'Unknown', bid: 0, bids: 0, status: 'unknown', ends: 'Awaiting Expert', sellerName: 'Ion Popescu' },
];

const MOCK_AUDIT: AuditEntry[] = [
  { id: 1, timestamp: '29 Mar 2026 · 09:14', adminName: 'Demo Admin', action: 'ROLE_CHANGE',    target: 'Ion Popescu',   detail: 'Role changed: guest → bidder' },
  { id: 2, timestamp: '29 Mar 2026 · 09:10', adminName: 'Demo Admin', action: 'USER_SUSPEND',   target: 'Alex Chen',     detail: 'Account suspended (terms violation)' },
  { id: 3, timestamp: '28 Mar 2026 · 17:45', adminName: 'Demo Admin', action: 'AUCTION_END',    target: 'Lumière dorée', detail: 'Auction ended manually by admin' },
  { id: 4, timestamp: '28 Mar 2026 · 15:20', adminName: 'Demo Admin', action: 'USER_SOFT_DEL',  target: 'Radu Marin',    detail: 'Account soft-deleted — history preserved' },
  { id: 5, timestamp: '27 Mar 2026 · 11:00', adminName: 'Demo Admin', action: 'ROLE_CHANGE',    target: 'Elena Savu',    detail: 'Role changed: bidder → expert' },
  { id: 6, timestamp: '26 Mar 2026 · 09:30', adminName: 'Demo Admin', action: 'USER_REACTIVATE',target: 'Maria Vasile',  detail: 'Account reactivated after appeal' },
];

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
const ROLES: AdminUser['role'][] = ['guest', 'bidder', 'seller', 'expert', 'admin'];
const MONTHLY = [
  { month: 'Oct', v: 42 }, { month: 'Nov', v: 58 }, { month: 'Dec', v: 51 },
  { month: 'Jan', v: 74 }, { month: 'Feb', v: 65 }, { month: 'Mar', v: 88 },
];
const max = Math.max(...MONTHLY.map(d => d.v));

const ACTION_COLORS: Record<string, string> = {
  ROLE_CHANGE: '#c4974a', USER_SUSPEND: '#8b3a2a', AUCTION_END: '#4a6741',
  USER_SOFT_DEL: '#6b5e4e', USER_REACTIVATE: '#4a6741',
};

/* ══════════════════════════════════════════════════════════
   MAIN
   ══════════════════════════════════════════════════════════ */
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { users: dbUsers, appointments, updateUserRole } = useData();

  const [tab, setTab] = useState<AdminTab>('overview');
  // Combine mock users with contexts for UI completeness
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [auctions, setAuctions] = useState<AdminAuction[]>(MOCK_AUCTIONS);
  const [audit, setAudit] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [userSearch, setUserSearch] = useState('');
  const [auctionSearch, setAuctionSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const auditId = React.useRef(100);

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  const showToast = (msg: string) => {
    setToast(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const logAudit = (action: string, target: string, detail: string) => {
    const now = new Date();
    const ts = now.toLocaleDateString('en-GB', { day:'2-digit',month:'short',year:'numeric' })
      + ' · ' + now.toLocaleTimeString('en-GB', { hour:'2-digit',minute:'2-digit' });
    setAudit(prev => [{ id: ++auditId.current, timestamp: ts, adminName: user.name, action, target, detail }, ...prev]);
  };

  /* User actions */
  const suspendUser = (u: AdminUser) => {
    if (!window.confirm(`Suspend ${u.name}?`)) return;
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'suspended' } : x));
    logAudit('USER_SUSPEND', u.name, 'Account suspended by admin');
    showToast(`${u.name} suspended.`);
  };

  const reactivateUser = (u: AdminUser) => {
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'active' } : x));
    logAudit('USER_REACTIVATE', u.name, 'Account reactivated');
    showToast(`${u.name} reactivated.`);
  };

  const softDeleteUser = (u: AdminUser) => {
    if (!window.confirm(`Soft-delete ${u.name}? Their transaction history will be preserved.`)) return;
    const now = new Date().toLocaleDateString('en-GB', { day:'2-digit',month:'short',year:'numeric' });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'deleted', deletedAt: now } : x));
    logAudit('USER_SOFT_DEL', u.name, `Account soft-deleted — history preserved. Date: ${now}`);
    showToast(`${u.name} soft-deleted. History preserved.`);
  };

  const changeRole = (u: AdminUser, newRole: AdminUser['role']) => {
    if (u.role === 'admin') { showToast("Cannot change admin role."); return; }
    const old = u.role;
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
    logAudit('ROLE_CHANGE', u.name, `Role changed: ${old} → ${newRole}`);
    showToast(`${u.name}: ${old} → ${newRole}`);
  };

  const endAuction = (a: AdminAuction) => {
    if (!window.confirm(`End auction "${a.title}"?`)) return;
    setAuctions(prev => prev.map(x => x.id === a.id ? { ...x, status: 'ended', ends: 'Ended by admin' } : x));
    logAudit('AUCTION_END', a.title, `Auction ended manually`);
    showToast(`Auction "${a.title}" ended.`);
  };

  /* Filtered lists */
  const activeUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchDel = showDeleted || u.status !== 'deleted';
    return matchSearch && matchDel;
  });

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(auctionSearch.toLowerCase()) ||
    a.artist.toLowerCase().includes(auctionSearch.toLowerCase())
  );

  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const deletedCount = users.filter(u => u.status === 'deleted').length;
  const liveCount = auctions.filter(a => a.status === 'active').length;

  return (
    <main className="admin-page">
      <div className="admin-layout">

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__label">Overview</div>
          <button className={`admin-sidebar__link ${tab === 'overview' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('overview')}>◈ Dashboard</button>

          <div className="admin-sidebar__label">Management</div>
          <button className={`admin-sidebar__link ${tab === 'auctions' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('auctions')}>⊛ Auctions</button>
          <button className={`admin-sidebar__link ${tab === 'users' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('users')}>◑ Users</button>
          <button className={`admin-sidebar__link ${tab === 'calendars' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('calendars')}>📅 Expert Calendars</button>

          <div className="admin-sidebar__label">Audit</div>
          <button className={`admin-sidebar__link ${tab === 'audit' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('audit')}>📋 Audit Log</button>

          <div className="admin-sidebar__label">Navigation</div>
          <Link to="/" className="admin-sidebar__link">← Back to Site</Link>
        </aside>

        {/* ── Content ── */}
        <div className="admin-content">
          <div className="admin-content__header">
            <div>
              <h1 className="admin-content__title">
                {tab === 'overview' ? 'Dashboard' : tab === 'users' ? 'User Management' : tab === 'auctions' ? 'Auction Management' : 'Audit Log'}
              </h1>
              <p className="admin-content__sub">Signed in as: {user.name} · {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long' })}</p>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (<>
            <div className="admin-stats-row">
              <div className="admin-stat"><span className="admin-stat__label">Active Users</span><span className="admin-stat__value">{activeCount}</span><span className="admin-stat__change admin-stat__change--up">↑ +3 this week</span></div>
              <div className="admin-stat"><span className="admin-stat__label">Suspended</span><span className="admin-stat__value">{suspendedCount}</span><span className="admin-stat__change admin-stat__change--down">Requires action</span></div>
              <div className="admin-stat"><span className="admin-stat__label">Soft-Deleted</span><span className="admin-stat__value">{deletedCount}</span><span className="admin-stat__change">History preserved</span></div>
              <div className="admin-stat"><span className="admin-stat__label">Live Auctions</span><span className="admin-stat__value">{liveCount}</span><span className="admin-stat__change admin-stat__change--up">↑ Active now</span></div>
            </div>

            <div className="admin-charts-row">
              <div className="admin-chart-card">
                <h3 className="admin-chart-card__title">Monthly Bid Volume (€k)</h3>
                <div className="admin-bar-chart">
                  {MONTHLY.map(d => (
                    <div key={d.month} className="admin-bar-wrap">
                      <div className="admin-bar" style={{ height: `${(d.v / max) * 100}%` }} title={`€${d.v}k`} />
                      <span className="admin-bar-lbl">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-chart-card">
                <h3 className="admin-chart-card__title">Sales by Category</h3>
                <div className="admin-donut-wrap"><div className="admin-donut" /></div>
                <div className="admin-legend">
                  {[['var(--gold)','Painting','42%'],['var(--ink-soft)','Sculpture','23%'],['var(--ink-faint)','Photography','15%'],['var(--parchment)','Mixed Media','20%']].map(([c,l,p]) => (
                    <div key={l} className="admin-legend__item">
                      <span className="admin-legend__dot" style={{ background: c }} />
                      <span>{l} · {p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-quick-tables">
              <div className="admin-table-card">
                <div className="admin-table-card__head"><h3>Recent Auctions</h3><button className="admin-table-card__see-all" onClick={() => setTab('auctions')}>See all →</button></div>
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Current Bid</th><th>Status</th><th>Ends</th></tr></thead>
                  <tbody>
                    {MOCK_AUCTIONS.slice(0,4).map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.title}</strong><br/><span style={{fontSize:11.5,color:'var(--ink-muted)'}}>{a.artist}</span></td>
                        <td>{a.bid > 0 ? `€${a.bid.toLocaleString()}` : '—'}</td>
                        <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                        <td style={{fontSize:12,color:'var(--ink-muted)'}}>{a.ends}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-table-card">
                <div className="admin-table-card__head"><h3>Recent Users</h3><button className="admin-table-card__see-all" onClick={() => setTab('users')}>See all →</button></div>
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>
                    {MOCK_USERS.slice(0,4).map(u => (
                      <tr key={u.id}>
                        <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="admin-avatar">{u.name.charAt(0)}</div><div><div style={{fontWeight:500,fontSize:13}}>{u.name}</div><div style={{fontSize:11.5,color:'var(--ink-muted)'}}>{u.email}</div></div></div></td>
                        <td><span className="admin-role-badge">{u.role}</span></td>
                        <td><span className={`admin-status admin-status--${u.status}`}>{u.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>)}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Registered Users ({activeUsers.length})</h3>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <label style={{fontSize:12.5,color:'var(--ink-muted)',display:'flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                    <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} style={{accentColor:'var(--gold)'}} />
                    Show soft-deleted
                  </label>
                  <input className="admin-search" placeholder="Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Joined</th><th>Bids</th><th>Spent</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {activeUsers.map(u => (
                    <tr key={u.id} style={u.status === 'deleted' ? { opacity: .55 } : {}}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="admin-avatar">{u.name.charAt(0)}</div>
                          <div>
                            <div style={{fontWeight:500,fontSize:13.5}}>{u.name}</div>
                            <div style={{fontSize:11.5,color:'var(--ink-muted)'}}>{u.email}</div>
                            {u.status === 'deleted' && <div style={{fontSize:10.5,color:'var(--rust)',marginTop:2}}>Soft-deleted · {u.deletedAt}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {u.role !== 'admin' && u.status !== 'deleted' ? (
                          <select
                            className="admin-role-select"
                            value={u.role}
                            onChange={e => changeRole(u, e.target.value as AdminUser['role'])}
                          >
                            {ROLES.filter(r => r !== 'admin').map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : (
                          <span className="admin-role-badge">{u.role}</span>
                        )}
                      </td>
                      <td style={{fontSize:12.5,color:'var(--ink-muted)'}}>{u.joined}</td>
                      <td>{u.bids}</td>
                      <td>{u.spent > 0 ? `€${u.spent.toLocaleString()}` : '—'}</td>
                      <td><span className={`admin-status admin-status--${u.status}`}>{u.status}</span></td>
                      <td>
                        <div className="admin-action-btns">
                          {u.status === 'active' && u.role !== 'admin' && (
                            <button className="admin-action-btn admin-action-btn--del" onClick={() => suspendUser(u)}>Suspend</button>
                          )}
                          {u.status === 'suspended' && (
                            <>
                              <button className="admin-action-btn admin-action-btn--edit" onClick={() => reactivateUser(u)}>Reactivate</button>
                              <button className="admin-action-btn admin-action-btn--del" onClick={() => softDeleteUser(u)}>Soft Delete</button>
                            </>
                          )}
                          {u.status === 'deleted' && (
                            <button className="admin-action-btn admin-action-btn--edit" onClick={() => reactivateUser(u)}>Restore</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="admin-table-note">
                ⚠ Soft-deleted accounts are not physically removed. Their data is preserved in transaction history as required by platform policy.
              </div>
            </div>
          )}

          {/* ── AUCTIONS ── */}
          {tab === 'auctions' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>All Auctions ({filteredAuctions.length})</h3>
                <input className="admin-search" placeholder="Search auctions…" value={auctionSearch} onChange={e => setAuctionSearch(e.target.value)} />
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Artwork</th><th>Seller</th><th>Category</th><th>Bid</th><th>Bids</th><th>Status</th><th>Ends</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredAuctions.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.title}</strong><br/><span style={{fontSize:11.5,color:'var(--ink-muted)'}}>{a.artist}</span></td>
                      <td style={{fontSize:12.5}}>{a.sellerName}</td>
                      <td>{a.category === 'Unknown' ? <span className="admin-status admin-status--unknown">Unknown</span> : a.category}</td>
                      <td>{a.bid > 0 ? `€${a.bid.toLocaleString()}` : '—'}</td>
                      <td>{a.bids}</td>
                      <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                      <td style={{fontSize:12,color:'var(--ink-muted)'}}>{a.ends}</td>
                      <td>
                        <div className="admin-action-btns">
                          <Link to={`/auctions/${a.id}`} className="admin-action-btn admin-action-btn--edit">View</Link>
                          {a.status === 'active' && (
                            <button className="admin-action-btn admin-action-btn--del" onClick={() => endAuction(a)}>End</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── AUDIT LOG ── */}
          {tab === 'audit' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Audit Log — All Admin Actions</h3>
                <span style={{fontSize:12.5,color:'var(--ink-muted)'}}>{audit.length} records</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  {audit.map(e => (
                    <tr key={e.id}>
                      <td style={{fontSize:12,color:'var(--ink-muted)',whiteSpace:'nowrap'}}>{e.timestamp}</td>
                      <td style={{fontSize:13}}>{e.adminName}</td>
                      <td>
                        <span className="admin-audit-action" style={{ borderLeftColor: ACTION_COLORS[e.action] ?? 'var(--gold)' }}>
                          {e.action}
                        </span>
                      </td>
                      <td style={{fontWeight:500,fontSize:13}}>{e.target}</td>
                      <td style={{fontSize:12.5,color:'var(--ink-soft)'}}>{e.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── CALENDARS ── */}
          {tab === 'calendars' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Expert Appointments</h3>
                <span style={{fontSize:12.5,color:'var(--ink-muted)'}}>{appointments.length} appointments scheduled</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Expert ID</th><th>Date</th><th>Product ID</th><th>Seller ID</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td style={{fontWeight:500}}>Exp {a.expertId}</td>
                      <td>{new Date(a.date).toLocaleString()}</td>
                      <td>Prod #{a.productId}</td>
                      <td>Sell #{a.sellerId}</td>
                      <td style={{fontSize:13}}>{a.location}</td>
                      <td><span className={`admin-status admin-status--${a.status.toLowerCase()}`}>{a.status}</span></td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr><td colSpan={6} style={{textAlign:'center', padding: '30px', color: 'var(--ink-muted)'}}>No appointments scheduled yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default AdminPage;