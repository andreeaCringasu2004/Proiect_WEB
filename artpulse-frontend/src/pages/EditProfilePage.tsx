import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EditProfilePage.css';

const EditProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const [form, setForm] = useState({
    firstName: user.name.split(' ')[0] ?? '',
    lastName:  user.name.split(' ')[1] ?? '',
    email:     'user@example.com',
    phone:     '',
    location:  'Bucharest, Romania',
    bio:       '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'danger'>('profile');

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email) { showToast('Please fill in required fields.'); return; }
    showToast('✓ Profile saved successfully!');
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current) { showToast('Enter your current password.'); return; }
    if (pwForm.next.length < 8) { showToast('New password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { showToast('Passwords do not match.'); return; }
    showToast('✓ Password updated!');
    setPwForm({ current: '', next: '', confirm: '' });
  };

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  return (
    <main className="ep-page">
      <div className="container ep-wrap">
        {/* Sidebar */}
        <aside className="ep-sidebar">
          <div className="ep-avatar">{initials || user.name.charAt(0).toUpperCase()}</div>
          <div className="ep-sidebar__name">{form.firstName} {form.lastName}</div>
          <div className="ep-sidebar__role">{user.role}</div>

          <nav className="ep-nav">
            <button className={`ep-nav__link ${activeSection === 'profile' ? 'ep-nav__link--active' : ''}`} onClick={() => setActiveSection('profile')}>Edit Profile</button>
            <button className={`ep-nav__link ${activeSection === 'password' ? 'ep-nav__link--active' : ''}`} onClick={() => setActiveSection('password')}>Change Password</button>
            <Link to="/auctions" className="ep-nav__link">My Bids</Link>
            <Link to="/watchlist" className="ep-nav__link">Watchlist</Link>
            <button className={`ep-nav__link ep-nav__link--danger ${activeSection === 'danger' ? 'ep-nav__link--active' : ''}`} onClick={() => setActiveSection('danger')}>Danger Zone</button>
          </nav>
        </aside>

        {/* Main content */}
        <div className="ep-main">
          {/* Stats */}
          <div className="ep-stats">
            {[
              { label: 'Bids Placed', value: '24' },
              { label: 'Works Won', value: '3' },
              { label: 'Watchlist', value: '12' },
              { label: 'Member Since', value: 'Jan 2026' },
            ].map(s => (
              <div key={s.label} className="ep-stat">
                <span className="ep-stat__value">{s.value}</span>
                <span className="ep-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Profile form */}
          {activeSection === 'profile' && (
            <div className="ep-section">
              <h2 className="ep-section__title">Personal Information</h2>
              <form onSubmit={handleSave} noValidate>
                <div className="ep-form-row">
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="firstName">First Name *</label>
                    <input id="firstName" name="firstName" type="text" className="ep-input" value={form.firstName} onChange={handleChange} placeholder="Ion" />
                  </div>
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="lastName">Last Name</label>
                    <input id="lastName" name="lastName" type="text" className="ep-input" value={form.lastName} onChange={handleChange} placeholder="Popescu" />
                  </div>
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="email">Email Address *</label>
                  <input id="email" name="email" type="email" className="ep-input" value={form.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="phone">Phone (optional)</label>
                  <input id="phone" name="phone" type="tel" className="ep-input" value={form.phone} onChange={handleChange} placeholder="+40 712 345 678" />
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="location">Location</label>
                  <input id="location" name="location" type="text" className="ep-input" value={form.location} onChange={handleChange} placeholder="City, Country" />
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="bio">Bio</label>
                  <textarea id="bio" name="bio" className="ep-textarea" value={form.bio} onChange={handleChange} placeholder="Tell us about your collection interests…" rows={4} />
                </div>
                <button type="submit" className="ep-save-btn">Save Changes</button>
              </form>
            </div>
          )}

          {/* Password form */}
          {activeSection === 'password' && (
            <div className="ep-section">
              <h2 className="ep-section__title">Change Password</h2>
              <form onSubmit={handlePassword} noValidate>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="current">Current Password</label>
                  <input id="current" type="password" className="ep-input" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} placeholder="••••••••" />
                </div>
                <div className="ep-form-row">
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="next">New Password</label>
                    <input id="next" type="password" className="ep-input" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" />
                  </div>
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="confirm">Confirm New Password</label>
                    <input id="confirm" type="password" className="ep-input" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat" />
                  </div>
                </div>
                <button type="submit" className="ep-save-btn ep-save-btn--ghost">Update Password</button>
              </form>
            </div>
          )}

          {/* Danger zone */}
          {activeSection === 'danger' && (
            <div className="ep-section ep-section--danger">
              <h2 className="ep-section__title ep-section__title--danger">Danger Zone</h2>
              <p className="ep-danger-text">
                Deleting your account is permanent and irreversible. All your bid history, watchlist,
                and profile data will be permanently removed from our systems.
              </p>
              <button
                className="ep-delete-btn"
                onClick={() => {
                  if (window.confirm('Are you absolutely sure? This cannot be undone.')) {
                    showToast('Account deletion scheduled. You will receive an email.');
                  }
                }}
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div className={`ad-toast ${toastVisible ? 'ad-toast--visible' : ''}`}>{toast}</div>
    </main>
  );
};

export default EditProfilePage;