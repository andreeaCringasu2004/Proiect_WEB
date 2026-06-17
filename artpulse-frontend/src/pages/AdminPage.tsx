import React, { useState, useRef, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { authService } from '../services/authService';
import { userService, mapBackendUser } from '../services/userService';
import { auctionService } from '../services/auctionService';
import './AdminPage.css';

const selectMockImage = (fileName: string) => {
  const hash = Array.from(fileName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const images = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80',
    'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
  ];
  return images[hash % images.length];
};


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

// Luni afisate in graficul bara (ultimele 6 luni fata de Mai 2026)
const CHART_MONTHS = [
  { month: 'Nov', year: 2025 },
  { month: 'Dec', year: 2025 },
  { month: 'Jan', year: 2026 },
  { month: 'Feb', year: 2026 },
  { month: 'Mar', year: 2026 },
  { month: 'Apr', year: 2026 },
];

// Culori categorii donut
const CATEGORY_COLORS: Record<string, string> = {
  'Painting':   '#c4974a',
  'Sculpture':  '#3d3830',
  'Photography':'#b8b0a4',
  'Mixed Media':'#e8e0d0',
  'Abstract':   '#4a6741',
  'Digital Art':'#8b5e3c',
  'Glass Art':  '#6b9b8e',
  'Installation':'#7a6b5a',
};

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
  const [resetModal, setResetModal] = useState<{ user: AdminUser; tempPassword: string } | null>(null);
  const [resetLoading, setResetLoading] = useState<number | null>(null);
  const [revealedMsgIds, setRevealedMsgIds] = useState<number[]>([]);
  const [chatDocs, setChatDocs] = useState<string[]>([]);
  const chatFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adminChatRef.current) {
      adminChatRef.current.style.height = 'auto';
      const newHeight = Math.min(adminChatRef.current.scrollHeight, 100);
      adminChatRef.current.style.height = `${newHeight}px`;
    }
  }, [adminChatInput]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data.map(mapBackendUser));
      } catch (err) {
        console.error("Failed to fetch users", err);
        showToast("Error loading users from database.");
      }
    };
    fetchUsers();
  }, [setUsers]);

  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const auditId = React.useRef(100);


  const adminUsers: AdminUser[] = allUsers.map(u => ({
    id: u.id || 0,
    name: u.name,
    email: u.email || '',
    role: u.role as any,
    joined: (u as any).joined || 'Apr 2026',
    bids: bids.filter(b => b.bidder === u.name).length,
    spent: bids.filter(b => b.bidder === u.name).reduce((sum, b) => sum + b.amount, 0),
    status: (u as any).status || 'active',
    deletedAt: (u as any).deletedAt
  }));

  // Grafic bare: balanta neta pe luni
  const monthlyData = React.useMemo(() => {
    const seedValues = [-12, 15, 28, -5, 85, 210];
    const data = CHART_MONTHS.map((m, i) => ({ ...m, v: seedValues[i] || 10 }));
    bids.forEach(b => {
      data[5].v += b.amount / 1000;
    });
    return data;
  }, [bids]);
  const maxV = Math.max(...monthlyData.map((d: any) => Math.max(0, d.v)), 10);
  const minV = Math.min(...monthlyData.map((d: any) => Math.min(0, d.v)), -10);
  const range = maxV - minV;

  // Grafic donut: categorii reale din auctions
  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    auctions.forEach(a => {
      const cat = a.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => ({
        cat,
        count,
        pct: Math.round((count / total) * 100),
        color: CATEGORY_COLORS[cat] || '#999'
      }));
  }, [auctions]);

  // Genereaza conic-gradient din date reale
  const donutGradient = React.useMemo(() => {
    let acc = 0;
    const parts = categoryData.map(({ pct, color }) => {
      const start = acc;
      acc += pct;
      return `${color} ${start}% ${acc}%`;
    });
    // Restul (daca nu sunt 100%) in gri
    if (acc < 100) parts.push(`#ccc ${acc}% 100%`);
    return `conic-gradient(${parts.join(', ')})`;
  }, [categoryData]);

  const showToast = (msg: string) => {
    setToast(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const logAudit = (action: string, target: string, detail: string) => {
    const now = new Date();
    const ts = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setAudit(prev => [{ id: ++auditId.current, timestamp: ts, adminName: user?.name || 'Admin', action, target, detail }, ...prev]);
  };


  const currentChatMsgs = messages.filter(m => m.productId === selectedChatProdId);
  const sendAdminChat = () => {
    if ((!adminChatInput.trim() && chatDocs.length === 0) || !user) return;
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
      time,
      documents: chatDocs
    });
    setAdminChatInput('');
    setChatDocs([]);
  };

  React.useEffect(() => {
    if (tab === 'support') {
      requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [messages, selectedChatProdId, tab]);

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  const suspendUser = async (u: AdminUser) => {
    if (!window.confirm(`Suspend ${u.name}?`)) return;
    try {
      await userService.updateStatus(u.id, 'DEACTIVATED');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'suspended' } : x));
      logAudit('USER_SUSPEND', u.name, 'Account suspended by admin');
      showToast(`${u.name} suspended.`);
    } catch (err) {
      showToast("Eroare la suspendarea utilizatorului.");
      console.error(err);
    }
  };

  const reactivateUser = async (u: AdminUser) => {
    try {
      await userService.updateStatus(u.id, 'ACTIVE');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'active' } : x));
      logAudit('USER_REACTIVATE', u.name, 'Account reactivated');
      showToast(`${u.name} reactivated.`);
    } catch (err) {
      showToast("Eroare la reactivarea utilizatorului.");
      console.error(err);
    }
  };

  const softDeleteUser = async (u: AdminUser) => {
    if (!window.confirm(`Soft-delete ${u.name}? Their transaction history will be preserved.`)) return;
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    try {
      await userService.deleteUser(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: 'deleted', deletedAt: now } : x));
      logAudit('USER_SOFT_DEL', u.name, `Account soft-deleted — history preserved. Date: ${now}`);
      showToast(`${u.name} soft-deleted. History preserved.`);
    } catch (err) {
      showToast("Eroare la stergerea utilizatorului.");
      console.error(err);
    }
  };

  const changeRole = async (u: AdminUser, newRole: AdminUser['role']) => {
    if (u.role === 'admin') { showToast("Cannot change admin role."); return; }
    if (newRole === 'admin') {
      const confirmPromote = window.confirm(`Are you sure you want to promote ${u.name} to ADMIN? They will receive full administrative privileges.`);
      if (!confirmPromote) return;
    }
    const old = u.role;
    try {
      await userService.updateRole(u.id, newRole.toUpperCase());
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
      logAudit('ROLE_CHANGE', u.name, `Role changed: ${old} → ${newRole}`);
      showToast(`${u.name}: ${old} → ${newRole}`);
    } catch (err) {
      showToast("Eroare la schimbarea rolului.");
      console.error(err);
    }
  };

  const endAuction = async (a: any) => {
    if (!window.confirm(`End auction "${a.title}"?`)) return;
    try {
      await auctionService.closeAuction(a.id);
      setAuctions(prev => prev.map(x => x.id === a.id ? { ...x, status: 'sold' } : x));
      logAudit('AUCTION_END', a.title, `Auction ended manually`);
      showToast(`Auction "${a.title}" ended.`);
    } catch (err) {
      showToast("Eroare la inchiderea licitatiei.");
      console.error(err);
    }
  };

  const resetPassword = async (u: AdminUser) => {
    if (u.role === 'admin') { showToast('Cannot reset admin password.'); return; }
    setResetLoading(u.id);
    try {
      const result = await authService.resetUserPassword(u.id);
      logAudit('PWD_RESET', u.name, `Password reset to temporary. User must change on next login.`);
      setResetModal({ user: u, tempPassword: result.temporaryPassword || 'ResetPass@2026' });
      showToast(`✓ Parola lui ${u.name} a fost resetată.`);
    } catch {
      // Daca backend nu e pornit, simulam local pentru demo
      logAudit('PWD_RESET', u.name, `Password reset to temporary (simulated). User must change on next login.`);
      setResetModal({ user: u, tempPassword: 'ResetPass@2026' });
      showToast(`✓ Parola lui ${u.name} a fost resetată (simulat).`);
    } finally {
      setResetLoading(null);
    }
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
                <h3 className="admin-chart-card__title">Monthly Net Balance (€k)</h3>
                <div className="admin-bar-chart-container" style={{ position: 'relative', height: '140px', marginTop: '10px', marginBottom: '35px' }}>
                  <div style={{ position: 'absolute', top: `${(maxV / range) * 100}%`, left: 0, right: 0, height: '1px', background: 'rgba(26, 23, 20, 0.1)', zIndex: 1 }} />
                  
                  <div className="admin-bar-chart" style={{ height: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: '12px', position: 'relative' }}>
                    {monthlyData.map((d: any) => {
                      const isNeg = d.v < 0;
                      const heightPct = (Math.abs(d.v) / range) * 100;
                      const color = isNeg ? 'var(--rust, #8b3a2a)' : (d.v > 40 ? 'var(--sage, #4a6741)' : '#4a6b8c');
                      const zeroTop = (maxV / range) * 100;
                      
                      return (
                        <div key={d.month} className="admin-bar-wrap" style={{ flex: 1, position: 'relative', zIndex: 2, height: '100%' }}>
                           {!isNeg ? (
                             <div className="admin-bar" style={{ position: 'absolute', bottom: `${100 - zeroTop}%`, left: '10%', width: '80%', height: `${heightPct}%`, background: color, borderRadius: '3px 3px 0 0', opacity: 0.8 }} title={`€${d.v.toFixed(1)}k`} />
                           ) : (
                             <div className="admin-bar" style={{ position: 'absolute', top: `${zeroTop}%`, left: '10%', width: '80%', height: `${heightPct}%`, background: color, borderRadius: '0 0 3px 3px', opacity: 0.8 }} title={`€${d.v.toFixed(1)}k`} />
                           )}
                           
                           <div style={{ position: 'absolute', bottom: '-35px', left: 0, right: 0, textAlign: 'center' }}>
                             <div className="admin-bar-lbl" style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{d.month}</div>
                             <div style={{ fontSize: '9.5px', color: 'var(--ink-muted)', marginTop: '-2px' }}>€{d.v.toFixed(0)}k</div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="admin-chart-card">
                <h3 className="admin-chart-card__title">Sales by Category</h3>
                <div className="admin-donut-wrap">
                  <div className="admin-donut" style={{ background: donutGradient }} />
                </div>
                <div className="admin-legend">
                  {categoryData.map(({ cat, pct, count, color }) => (
                    <div key={cat} className="admin-legend__item">
                      <span className="admin-legend__dot" style={{ background: color }} />
                      <span>{cat} · {pct}% <span style={{ color: 'var(--ink-muted)', fontSize: 11 }}>({count})</span></span>
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
                              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
                              <>
                                <button
                                  className="admin-action-btn admin-action-btn--reset"
                                  onClick={() => resetPassword(u)}
                                  disabled={resetLoading === u.id}
                                  title="Reset parola la ResetPass@2026"
                                >
                                  {resetLoading === u.id ? '...' : '🔑 Reset Pwd'}
                                </button>
                                <button className="admin-action-btn admin-action-btn--del" onClick={() => suspendUser(u)}>Suspend</button>
                              </>
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
                {allProducts.filter(p => p.status?.toLowerCase() !== 'draft').map(p => (
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
                          {!isOwn && <div className="admin-chat-sender">{sender?.name || (m.fromId === 100 ? 'Admin ArtPulse' : 'User')}</div>}
                          <div className="admin-chat-text">
                            {m.isDeleted ? (
                              revealedMsgIds.includes(m.id) ? (
                                <span style={{ opacity: 0.7, color: 'var(--rust)', textDecoration: 'line-through' }}>
                                  {m.text} [Deleted - Revealed]
                                </span>
                              ) : (
                                <em style={{ opacity: 0.6 }}>Mesaj șters</em>
                              )
                            ) : (
                              m.text
                            )}
                            {m.isDeleted && (
                              <button
                                onClick={() => {
                                  if (revealedMsgIds.includes(m.id)) {
                                    setRevealedMsgIds(prev => prev.filter(id => id !== m.id));
                                  } else {
                                    setRevealedMsgIds(prev => [...prev, m.id]);
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  marginLeft: '8px',
                                  padding: 0,
                                  fontSize: '13px',
                                  display: 'inline-flex',
                                  alignItems: 'center'
                                }}
                                title={revealedMsgIds.includes(m.id) ? "Ascunde mesaj" : "Vezi mesajul șters (Lupă)"}
                              >
                                🔍
                              </button>
                            )}
                          </div>
                          {m.documents && m.documents.length > 0 && (
                            <div className="admin-chat-docs" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                              {m.documents.map((d, idx) => {
                                const ext = d.split('.').pop()?.toLowerCase();
                                const isImg = ext ? ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) : false;
                                const displayUrl = d.startsWith('http') ? d : selectMockImage(d);
                                return (
                                  <div key={idx} className="admin-chat-doc" style={{ cursor: 'pointer' }}>
                                    {isImg ? (
                                      <img src={displayUrl} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '8px' }} onClick={() => window.open(displayUrl, '_blank')} />
                                    ) : (
                                      <div onClick={() => window.open(displayUrl, '_blank')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>📄</span> <span className="admin-chat-doc-name" style={{ textDecoration: 'underline', fontSize: '11px' }}>{d.substring(d.lastIndexOf('/') + 1)}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className="admin-chat-meta">
                            {m.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <div className="admin-chat-input-area" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                  {chatDocs.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 12px' }}>
                      {chatDocs.map((d, i) => {
                        const displayFilename = d.substring(d.lastIndexOf('/') + 1);
                        return (
                          <span key={i} style={{ fontSize: '9px', background: 'var(--gold-faint, rgba(196,151,74,0.1))', color: 'var(--gold-dark)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--gold-faint)' }}>
                            📄 {displayFilename.length > 20 ? displayFilename.substring(0, 20) + '...' : displayFilename} <span style={{ cursor: 'pointer', color: 'var(--error)' }} onClick={() => setChatDocs(p => p.filter((_, idx) => idx !== i))}>×</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <textarea
                      ref={adminChatRef}
                      className="admin-chat-input"
                      style={{ flex: 1, minHeight: '40px', maxHeight: '100px', resize: 'none', margin: 0 }}
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
                    <input
                      type="file"
                      multiple
                      hidden
                      ref={chatFileRef}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const uploadedUrls: string[] = [];
                        for (const file of files) {
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('http://localhost:8081/api/upload', {
                              method: 'POST',
                              body: formData
                            });
                            const data = await res.json();
                            if (data && data.url) {
                              uploadedUrls.push(data.url);
                            }
                          } catch (err) {
                            console.error('Failed to upload file:', err);
                            uploadedUrls.push(file.name);
                          }
                        }
                        setChatDocs(prev => [...prev, ...uploadedUrls]);
                      }}
                    />
                    <button
                      onClick={() => chatFileRef.current?.click()}
                      style={{ width: '40px', height: '40px', background: 'var(--white)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-strong)', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                      title="Atașează document"
                    >
                      📎
                    </button>
                    <button className="admin-action-btn admin-action-btn--edit" onClick={sendAdminChat} style={{ height: '40px', padding: '0 20px', fontSize: '14px', fontWeight: 600, margin: 0 }}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="admin-modal-overlay" onClick={() => setResetModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="admin-modal__header">
              <h2>🔑 Parolă Resetată</h2>
              <button className="admin-modal__close" onClick={() => setResetModal(null)}>✕</button>
            </div>
            <div className="admin-modal__content">
              <div className="admin-modal__row"><strong>Utilizator:</strong> {resetModal.user.name}</div>
              <div className="admin-modal__row"><strong>Email:</strong> {resetModal.user.email}</div>
              <div style={{ margin: '16px 0', padding: '14px 18px', background: 'rgba(196,151,74,.1)', borderRadius: 6, border: '1px solid var(--gold)' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Parola temporară</div>
                <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-dark, #956f22)', letterSpacing: '.08em' }}>{resetModal.tempPassword}</div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
                Comunică această parolă utilizatorului. La prima autentificare va vedea un banner de avertizare și va trebui să și-o schimbe din <strong>Edit Profile → Change Password</strong>.
              </p>
            </div>
            <div className="admin-modal__actions">
              <button
                className="admin-action-btn admin-action-btn--edit"
                onClick={() => { navigator.clipboard?.writeText(resetModal.tempPassword); showToast('✓ Copiat în clipboard!'); }}
              >📋 Copiază parola</button>
              <button className="admin-action-btn" onClick={() => setResetModal(null)} style={{ background: 'var(--parchment)' }}>Închide</button>
            </div>
          </div>
        </div>
      )}

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