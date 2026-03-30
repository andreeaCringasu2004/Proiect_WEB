import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

/* ── Mock data ── */
const MOCK_USERS = [
  { id: 1, name: 'Ion Popescu',   email: 'ion@example.com',   role: 'bidder', joined: 'Jan 2026', bids: 24, spent: 6200,  status: 'active' },
  { id: 2, name: 'Maria Vasile',  email: 'maria@example.com', role: 'seller', joined: 'Feb 2026', bids: 11, spent: 2800,  status: 'active' },
  { id: 3, name: 'Alex Chen',     email: 'alex@example.com',  role: 'bidder', joined: 'Mar 2026', bids: 3,  spent: 420,   status: 'suspended' },
  { id: 4, name: 'Sofia Lupu',    email: 'sofia@example.com', role: 'expert', joined: 'Mar 2026', bids: 8,  spent: 1540,  status: 'active' },
  { id: 5, name: 'Demo Admin',    email: 'admin@example.com', role: 'admin',  joined: 'Jan 2026', bids: 0,  spent: 0,     status: 'active' },
];

const MOCK_AUCTIONS = [
  { id: 1, title: 'Lumière dorée',    artist: 'Marie Leblanc',  category: 'Painting',    bid: 4200, bids: 18, status: 'active',   ends: '2h 14m' },
  { id: 2, title: 'Silent Forms',     artist: 'Kenji Watanabe', category: 'Sculpture',   bid: 8750, bids: 31, status: 'active',   ends: '5h 33m' },
  { id: 3, title: 'Urban Abstraction',artist: 'Sofia Petrov',   category: 'Photography', bid: 1900, bids: 7,  status: 'active',   ends: '11h 05m' },
  { id: 4, title: 'Golden Hour',      artist: 'Ama Diallo',     category: 'Painting',    bid: 3100, bids: 0,  status: 'upcoming', ends: 'Starts in 24h' },
  { id: 8, title: 'Fragile Geometry', artist: 'Ines Moreau',    category: 'Mixed Media', bid: 1450, bids: 14, status: 'active',   ends: '1h 45m' },
];

type AdminTab = 'overview' | 'auctions' | 'users';

/* ── Stat card ── */
interface StatCardProps { label: string; value: string; change: string; up: boolean }
const StatCard: React.FC<StatCardProps> = ({ label, value, change, up }) => (
  <div className="admin-stat">
    <span className="admin-stat__label">{label}</span>
    <span className="admin-stat__value">{value}</span>
    <span className={`admin-stat__change ${up ? 'admin-stat__change--up' : 'admin-stat__change--down'}`}>
      {up ? '↑' : '↓'} {change}
    </span>
  </div>
);

/* ── Bar chart ── */
const MONTHLY_BIDS = [
  { month: 'Oct', value: 42 }, { month: 'Nov', value: 58 }, { month: 'Dec', value: 51 },
  { month: 'Jan', value: 74 }, { month: 'Feb', value: 65 }, { month: 'Mar', value: 88 },
];
const BarChart: React.FC = () => {
  const max = Math.max(...MONTHLY_BIDS.map(d => d.value));
  return (
    <div className="admin-bar-chart">
      {MONTHLY_BIDS.map(d => (
        <div key={d.month} className="admin-bar-wrap">
          <div
            className="admin-bar"
            style={{ height: `${(d.value / max) * 100}%` }}
            title={`€${d.value}k`}
          />
          <span className="admin-bar-lbl">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Main AdminPage ── */
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [auctionSearch, setAuctionSearch] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Guard — only admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const toggleUserStatus = (id: number) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
    ));
    showToast('User status updated.');
  };

  const endAuction = (id: number) => {
    setAuctions(prev => prev.map(a => a.id === id ? { ...a, status: 'ended' } : a));
    showToast('Auction ended.');
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(auctionSearch.toLowerCase()) ||
    a.artist.toLowerCase().includes(auctionSearch.toLowerCase())
  );

  return (
    <main className="admin-page">
      {/* Sidebar + content layout */}
      <div className="admin-layout">

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__label">Overview</div>
          <button
            className={`admin-sidebar__link ${tab === 'overview' ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => setTab('overview')}
          >◈ Dashboard</button>

          <div className="admin-sidebar__label">Management</div>
          <button
            className={`admin-sidebar__link ${tab === 'auctions' ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => setTab('auctions')}
          >⊛ Auctions</button>
          <button
            className={`admin-sidebar__link ${tab === 'users' ? 'admin-sidebar__link--active' : ''}`}
            onClick={() => setTab('users')}
          >◑ Users</button>

          <div className="admin-sidebar__label">Navigation</div>
          <Link to="/" className="admin-sidebar__link">← Back to Site</Link>
        </aside>

        {/* ── Content ── */}
        <div className="admin-content">
          <div className="admin-content__header">
            <div>
              <h1 className="admin-content__title">
                {tab === 'overview' ? 'Dashboard' : tab === 'auctions' ? 'Auction Management' : 'User Management'}
              </h1>
              <p className="admin-content__sub">
                Welcome, {user.name} · Last login: today at 09:14
              </p>
            </div>
            {tab === 'overview' && (
              <button className="admin-new-btn" onClick={() => showToast('New auction form coming soon.')}>
                + New Auction
              </button>
            )}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              <div className="admin-stats-row">
                <StatCard label="Total Users"     value="18,420" change="+124 this week"  up={true} />
                <StatCard label="Active Auctions" value="5"      change="+2 since yesterday" up={true} />
                <StatCard label="Revenue (MTD)"   value="€48,200" change="+12% vs last month" up={true} />
                <StatCard label="Bids Today"      value="342"    change="-8% vs yesterday" up={false} />
              </div>

              <div className="admin-charts-row">
                <div className="admin-chart-card">
                  <h3 className="admin-chart-card__title">Monthly Bid Volume (€k)</h3>
                  <BarChart />
                </div>
                <div className="admin-chart-card">
                  <h3 className="admin-chart-card__title">Sales by Category</h3>
                  <div className="admin-donut-wrap">
                    <div className="admin-donut" />
                  </div>
                  <div className="admin-legend">
                    {[
                      { color: 'var(--gold)', label: 'Painting', pct: '42%' },
                      { color: 'var(--ink-soft)', label: 'Sculpture', pct: '23%' },
                      { color: 'var(--ink-faint)', label: 'Photography', pct: '15%' },
                      { color: 'var(--parchment)', label: 'Mixed Media', pct: '20%' },
                    ].map(l => (
                      <div key={l.label} className="admin-legend__item">
                        <span className="admin-legend__dot" style={{ background: l.color }} />
                        <span>{l.label} · {l.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick tables */}
              <div className="admin-quick-tables">
                <div className="admin-table-card">
                  <div className="admin-table-card__head">
                    <h3>Recent Auctions</h3>
                    <button className="admin-table-card__see-all" onClick={() => setTab('auctions')}>See all →</button>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Title</th><th>Bid</th><th>Status</th><th>Ends</th></tr></thead>
                    <tbody>
                      {MOCK_AUCTIONS.slice(0, 3).map(a => (
                        <tr key={a.id}>
                          <td><strong>{a.title}</strong><br /><span style={{fontSize:12,color:'var(--ink-muted)'}}>{a.artist}</span></td>
                          <td>€{a.bid.toLocaleString()}</td>
                          <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                          <td style={{fontSize:12,color:'var(--ink-muted)'}}>{a.ends}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="admin-table-card">
                  <div className="admin-table-card__head">
                    <h3>Recent Users</h3>
                    <button className="admin-table-card__see-all" onClick={() => setTab('users')}>See all →</button>
                  </div>
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
                    <tbody>
                      {MOCK_USERS.slice(0, 4).map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:9}}>
                              <div className="admin-avatar">{u.name.charAt(0)}</div>
                              <div>
                                <div style={{fontWeight:500,fontSize:13.5}}>{u.name}</div>
                                <div style={{fontSize:11.5,color:'var(--ink-muted)'}}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="admin-role-badge">{u.role}</span></td>
                          <td><span className={`admin-status admin-status--${u.status}`}>{u.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── AUCTIONS TAB ── */}
          {tab === 'auctions' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>All Auctions ({filteredAuctions.length})</h3>
                <input
                  className="admin-search"
                  placeholder="Search auctions…"
                  value={auctionSearch}
                  onChange={e => setAuctionSearch(e.target.value)}
                />
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Artwork</th><th>Artist</th><th>Category</th>
                    <th>Current Bid</th><th>Bids</th><th>Ends</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.title}</strong></td>
                      <td>{a.artist}</td>
                      <td>{a.category}</td>
                      <td>€{a.bid.toLocaleString()}</td>
                      <td>{a.bids}</td>
                      <td style={{fontSize:12,color:'var(--ink-muted)'}}>{a.ends}</td>
                      <td><span className={`admin-status admin-status--${a.status}`}>{a.status}</span></td>
                      <td>
                        <div className="admin-action-btns">
                          <Link to={`/auctions/${a.id}`} className="admin-action-btn admin-action-btn--edit">View</Link>
                          {a.status === 'active' && (
                            <button
                              className="admin-action-btn admin-action-btn--del"
                              onClick={() => { if (window.confirm('End this auction?')) endAuction(a.id); }}
                            >End</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-card__head">
                <h3>Registered Users ({filteredUsers.length})</h3>
                <input
                  className="admin-search"
                  placeholder="Search users…"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Role</th><th>Joined</th>
                    <th>Bids</th><th>Spent</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="admin-avatar">{u.name.charAt(0)}</div>
                          <div>
                            <div style={{fontWeight:500,fontSize:13.5}}>{u.name}</div>
                            <div style={{fontSize:11.5,color:'var(--ink-muted)'}}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="admin-role-badge">{u.role}</span></td>
                      <td style={{fontSize:12.5,color:'var(--ink-muted)'}}>{u.joined}</td>
                      <td>{u.bids}</td>
                      <td>€{u.spent.toLocaleString()}</td>
                      <td><span className={`admin-status admin-status--${u.status}`}>{u.status}</span></td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-action-btn admin-action-btn--edit" onClick={() => showToast('Profile view coming soon.')}>View</button>
                          {u.role !== 'admin' && (
                            <button
                              className={`admin-action-btn ${u.status === 'active' ? 'admin-action-btn--del' : 'admin-action-btn--edit'}`}
                              onClick={() => toggleUserStatus(u.id)}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default AdminPage;