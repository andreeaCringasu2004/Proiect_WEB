import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import './AdminPage.css';


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

interface AuditEntry {
  id: number;
  timestamp: string;
  adminName: string;
  action: string;
  target: string;
  detail: string;
}

type AdminTab = 'overview' | 'users' | 'auctions' | 'audit' | 'calendars' | 'support';

const MOCK_AUDIT: AuditEntry[] = [
  { id: 1, timestamp: '29 Mar 2026 · 09:14', adminName: 'Demo Admin', action: 'ROLE_CHANGE', target: 'Ion Popescu', detail: 'Role changed: guest → bidder' },
  { id: 2, timestamp: '29 Mar 2026 · 09:10', adminName: 'Demo Admin', action: 'USER_SUSPEND', target: 'Alex Chen', detail: 'Account suspended (terms violation)' },
  { id: 3, timestamp: '28 Mar 2026 · 17:45', adminName: 'Demo Admin', action: 'AUCTION_END', target: 'Lumière dorée', detail: 'Auction ended manually by admin' },
  { id: 4, timestamp: '28 Mar 2026 · 15:20', adminName: 'Demo Admin', action: 'USER_SOFT_DEL', target: 'Radu Marin', detail: 'Account soft-deleted — history preserved' },
  { id: 5, timestamp: '27 Mar 2026 · 11:00', adminName: 'Demo Admin', action: 'ROLE_CHANGE', target: 'Elena Savu', detail: 'Role changed: bidder → expert' },
  { id: 6, timestamp: '26 Mar 2026 · 09:30', adminName: 'Demo Admin', action: 'USER_REACTIVATE', target: 'Maria Vasile', detail: 'Account reactivated after appeal' },
];


const ROLES: AdminUser['role'][] = ['guest', 'bidder', 'seller', 'expert', 'admin'];

const MONTHLY_BASE = [
  { month: 'Nov', v: 0 }, { month: 'Dec', v: 0 },
  { month: 'Jan', v: 0 }, { month: 'Feb', v: 0 }, { month: 'Mar', v: 0 }, { month: 'Apr', v: 0 },
];

const ACTION_COLORS: Record<string, string> = {
  ROLE_CHANGE: '#c4974a', USER_SUSPEND: '#8b3a2a', AUCTION_END: '#4a6741',
  USER_SOFT_DEL: '#6b5e4e', USER_REACTIVATE: '#4a6741',
};


const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { users: allUsers, auctions, bids, appointments, setUsers, setAuctions, messages, addMessage, products: allProducts } = useData();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [auctionSearch, setAuctionSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>(MOCK_AUDIT);
  const [selectedChatProdId, setSelectedChatProdId] = useState<number>(-1);
  const [adminChatInput, setAdminChatInput] = useState('');
  const adminChatRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (adminChatRef.current) {
      adminChatRef.current.style.height = 'auto';
      const newHeight = Math.min(adminChatRef.current.scrollHeight, 100);
      adminChatRef.current.style.height = `${newHeight}px`;
    }
  }, [adminChatInput]);

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const auditId = React.useRef(100);


  const adminUsers: AdminUser[] = allUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as any,
    joined: u.joined || 'Apr 2026',
    bids: bids.filter(b => b.bidder === u.name).length,
    spent: bids.filter(b => b.bidder === u.name).reduce((sum, b) => sum + b.amount, 0),
    status: (u as any).status || 'active',
    deletedAt: (u as any).deletedAt
  }));

  const monthlyData = React.useMemo(() => {
    const data = JSON.parse(JSON.stringify(MONTHLY_BASE));
    const seedValues = [12, 18, 45, 32, 68, 85]; // Nov to Apr
    data.forEach((d: any, i: number) => {
      d.v = seedValues[i] || 10;
    });
    bids.forEach(b => {
      const monthIdx = 5; // current month (Apr)
      data[monthIdx].v += b.amount / 1000;
    });
    return data;
  }, [bids]);
  const maxVolume = Math.max(...monthlyData.map((d: any) => d.v), 10);

  const showToast = (msg: string) => {
    setToast(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const logAudit = (action: string, target: string, detail: string) => {
    const now = new Date();
    const ts = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setAudit(prev => [{ id: ++auditId.current, timestamp: ts, adminName: user.name, action, target, detail }, ...prev]);
  };


  const currentChatMsgs = messages.filter(m => m.productId === selectedChatProdId);
  const sendAdminChat = () => {
    if (!adminChatInput.trim() || !user) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });


    let toId = 0; // broadcast
    if (selectedChatProdId !== -1) {
      const prod = allProducts.find(p => p.id === selectedChatProdId);
      toId = prod?.sellerId || 103;
    }

    addMessage({
      id: Date.now(),
      productId: selectedChatProdId,
      fromId: user.id || 100,
      toId,
      text: adminChatInput.trim(),
      time
    });
    setAdminChatInput('');
  };

  React.useEffect(() => {
    if (tab === 'support') {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [messages, selectedChatProdId, tab]);

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

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
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

  const endAuction = (a: any) => {
    if (!window.confirm(`End auction "${a.title}"?`)) return;
    setAuctions(prev => prev.map(x => x.id === a.id ? { ...x, status: 'sold' } : x));
    logAudit('AUCTION_END', a.title, `Auction ended manually`);
    showToast(`Auction "${a.title}" ended.`);
  };


  const activeUsersFilter = adminUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleSearch ? u.role === roleSearch : true;
    const isVisible = showDeleted || u.status !== 'deleted';
    return matchSearch && matchRole && isVisible;
  });

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(auctionSearch.toLowerCase()) ||
    a.artist.toLowerCase().includes(auctionSearch.toLowerCase())
  );

  const activeCount = adminUsers.filter(u => u.status === 'active').length;
  const suspendedCount = adminUsers.filter(u => u.status === 'suspended').length;
  const deletedCount = adminUsers.filter(u => u.status === 'deleted').length;
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

          <div className="admin-sidebar__label">Support</div>
          <button className={`admin-sidebar__link ${tab === 'support' ? 'admin-sidebar__link--active' : ''}`} onClick={() => setTab('support')}>💬 Support & Chat</button>

          <div className="admin-sidebar__label">Navigation</div>
          <Link to="/" className="admin-sidebar__link">← Back to Site</Link>
        </aside>

        {/* ── Content ── */}
        <div className="admin-content">
          <div className="admin-content__header">
            <div>
              <h1 className="admin-content__title">
                {tab === 'overview' ? 'Dashboard' : tab === 'users' ? 'User Management' : tab === 'auctions' ? 'Auction Management' : tab === 'support' ? 'Support & Communications' : 'Audit Log'}
              </h1>
              <p className="admin-content__sub">Signed in as: {user.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
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
                  {monthlyData.map((d: any) => (
                    <div key={d.month} className="admin-bar-wrap">
                      <div className="admin-bar" style={{ height: `${(d.v / maxVolume) * 100}%` }} title={`€${d.v.toFixed(1)}k`} />
                      <span className="admin-bar-lbl">{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-chart-card">
                <h3 className="admin-chart-card__title">Sales by Category</h3>
                <div className="admin-donut-wrap"><div className="admin-donut" /></div>
                <div className="admin-legend">
                  {[['var(--gold)', 'Painting', '42%'], ['var(--ink-soft)', 'Sculpture', '23%'], ['var(--ink-faint)', 'Photography', '15%'], ['var(--parchment)', 'Mixed Media', '20%']].map(([c, l, p]) => (
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
                    {auctions.slice(0, 4).map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.title}</strong><br /><span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{a.artist}</span></td>
                        <td>€{a.currentBid.toLocaleString()}</td>
                        <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{new Date(a.endsAt).toLocaleDateString()}</td>
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
                    {adminUsers.slice(0, 4).map(u => (
                      <tr key={u.id}>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="admin-avatar">{u.name.charAt(0)}</div><div><div style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</div><div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{u.email}</div></div></div></td>
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
                <h3>Registered Users ({activeUsersFilter.length})</h3>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ fontSize: 12.5, color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
                    Show soft-deleted
                  </label>
                  <select
                    className="admin-role-select"
                    value={roleSearch}
                    onChange={e => setRoleSearch(e.target.value)}
                    style={{ background: 'var(--surface)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-strong)', fontSize: '13px' }}
                  >
                    <option value="">All Roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                  <input className="admin-search" placeholder="Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                </div>
              </div>

              <div className="admin-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>User</th><th>Role</th><th>Joined</th><th>Bids</th><th>Spent</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {activeUsersFilter.map(u => (
                      <tr key={u.id} style={u.status === 'deleted' ? { opacity: .55 } : {}}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="admin-avatar">{u.name.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13.5 }}>{u.name}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{u.email}</div>
                              {u.status === 'deleted' && <div style={{ fontSize: 10.5, color: 'var(--rust)', marginTop: 2 }}>Soft-deleted · {u.deletedAt}</div>}
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
                        <td style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>{u.joined}</td>
                        <td>{u.bids}</td>
                        <td>{u.spent > 0 ? `€${u.spent.toLocaleString()}` : '—'}</td>
                        <td><span className={`admin-status admin-status--${u.status}`}>{u.status}</span></td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="admin-action-btn admin-action-btn--edit" onClick={() => setSelectedUser(u)}>View Profile</button>
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
              </div>
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
              <div className="admin-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Artwork</th><th>Seller</th><th>Category</th><th>Bid</th><th>Bids</th><th>Status</th><th>Ends</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredAuctions.map(a => (
                      <tr key={a.id}>
                        <td><strong>{a.title}</strong><br /><span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{a.artist}</span></td>
                        <td style={{ fontSize: 12.5 }}>{a.sellerName}</td>
                        <td>{a.category === 'Unknown' ? <span className="admin-status admin-status--unknown">Unknown</span> : a.category}</td>
                        <td>{a.currentBid > 0 ? `€${a.currentBid.toLocaleString()}` : '—'}</td>
                        <td>{a.bidsCount}</td>
                        <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{new Date(a.endsAt).toLocaleDateString()}</td>
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
            </div>
          )}

          {/* ── AUDIT LOG ── */}
          {tab === 'audit' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Audit Log — All Admin Actions</h3>
                <span style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>{audit.length} records</span>
              </div>
              <div className="admin-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Timestamp</th><th>Admin</th><th>Action</th><th>Target</th><th>Detail</th></tr>
                  </thead>
                  <tbody>
                    {audit.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontSize: 12, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                        <td style={{ fontSize: 13 }}>{e.adminName}</td>
                        <td>
                          <span className="admin-audit-action" style={{ borderLeftColor: ACTION_COLORS[e.action] ?? 'var(--gold)' }}>
                            {e.action}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, fontSize: 13 }}>{e.target}</td>
                        <td style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{e.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── CALENDARS ── */}
          {tab === 'calendars' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Expert Appointments</h3>
                <span style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>{appointments.length} appointments scheduled</span>
              </div>
              <div className="admin-table-wrapper" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr><th>Expert ID</th><th>Date</th><th>Product ID</th><th>Seller ID</th><th>Location</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {appointments.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 500 }}>Exp {a.expertId}</td>
                        <td>{new Date(a.date).toLocaleString()}</td>
                        <td>Prod #{a.productId}</td>
                        <td>Sell #{a.sellerId}</td>
                        <td style={{ fontSize: 13 }}>{a.location}</td>
                        <td><span className={`admin-status admin-status--${a.status.toLowerCase()}`}>{a.status}</span></td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-muted)' }}>No appointments scheduled yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ── SUPPORT & CHAT ── */}
          {tab === 'support' && (
            <div className="admin-support-container">
              <aside className="admin-support-sidebar">
                <div className={`admin-support-item ${selectedChatProdId === -1 ? 'active' : ''}`} onClick={() => setSelectedChatProdId(-1)}>
                  <div className="icon">📢</div>
                  <div className="info">
                    <div className="title">Generic Q&A</div>
                    <div className="sub">Global Support Channel</div>
                  </div>
                </div>
                <div className="admin-support-divider">Review Specific Chats</div>
                {allProducts.filter(p => !['draft', 'sold'].includes(p.status?.toLowerCase())).map(p => (
                  <div key={p.id} className={`admin-support-item ${selectedChatProdId === p.id ? 'active' : ''}`} onClick={() => setSelectedChatProdId(p.id)}>
                    <img src={(p.images && p.images[0]) || 'https://via.placeholder.com/150'} alt={p.title} className="thumb" />
                    <div className="info">
                      <div className="title">{p.title}</div>
                      <div className="sub">Lot #{p.id} · Seller #{p.sellerId}</div>
                    </div>
                  </div>
                ))}
              </aside>

              <div className="admin-support-chat">
                <header className="admin-chat-header">
                  <h3>{selectedChatProdId === -1 ? 'Generic Q&A Channel' : allProducts.find(p => p.id === selectedChatProdId)?.title}</h3>
                </header>
                <div className="admin-chat-messages">
                  {currentChatMsgs.length === 0 && <div className="admin-chat-empty">No messages in this thread yet.</div>}
                  {currentChatMsgs.map(m => {
                    const isOwn = m.fromId === user.id;
                    const sender = allUsers.find(u => u.id === m.fromId);
                    return (
                      <div key={m.id} className={`admin-chat-msg ${isOwn ? 'admin-chat-msg--own' : 'admin-chat-msg--other'}`}>
                        <div className="admin-chat-bubble">
                          {!isOwn && <div className="admin-chat-sender">{sender?.name || 'User'}</div>}
                          <div className="admin-chat-text">{m.text}</div>
                          <div className="admin-chat-meta">
                            {m.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <div className="admin-chat-input-area">
                  <textarea
                    ref={adminChatRef}
                    className="admin-chat-input"
                    placeholder="Type a message..."
                    value={adminChatInput}
                    onChange={e => setAdminChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendAdminChat();
                      }
                    }}
                  />
                  <button className="admin-action-btn admin-action-btn--edit" onClick={sendAdminChat} style={{ height: '44px', padding: '0 20px', fontSize: '14px', fontWeight: 600 }}>Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h2>User Details: {selectedUser.name}</h2>
              <button className="admin-modal__close" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <div className="admin-modal__content">
              <div className="admin-modal__row"><strong>Email:</strong> {selectedUser.email}</div>
              <div className="admin-modal__row"><strong>Role:</strong> <span className="admin-role-badge">{selectedUser.role}</span></div>
              <div className="admin-modal__row"><strong>Status:</strong> <span className={`admin-status admin-status--${selectedUser.status}`}>{selectedUser.status}</span></div>
              <div className="admin-modal__row"><strong>Joined:</strong> {selectedUser.joined}</div>
              {selectedUser.deletedAt && <div className="admin-modal__row"><strong>Deleted at:</strong> {selectedUser.deletedAt}</div>}

              <hr style={{ margin: '20px 0', borderColor: 'var(--border)' }} />
              <h3>Activity Summary</h3>
              <div className="admin-modal__row"><strong>Total Bids Placed:</strong> {selectedUser.bids}</div>
              <div className="admin-modal__row"><strong>Total Spent:</strong> €{selectedUser.spent.toLocaleString()}</div>
            </div>
            <div className="admin-modal__actions">
              <button className="admin-action-btn admin-action-btn--edit" onClick={() => setSelectedUser(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default AdminPage;