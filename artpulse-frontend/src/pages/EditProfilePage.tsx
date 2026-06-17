import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import apiClient from '../api/apiClient';
import './EditProfilePage.css';

const EyeOpen = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const EyeClosed = () => <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

const EditProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();

  const stored = authService.getCurrentUser();
  const [form, setForm] = useState({
    firstName: (stored?.fullName ?? user?.name ?? '').split(' ')[0] ?? '',
    lastName:  (stored?.fullName ?? user?.name ?? '').split(' ').slice(1).join(' ') ?? '',
    email:     stored?.email ?? user?.email ?? 'user@example.com',
    phone:     '',
    location:  'Bucharest, Romania',
    bio:       '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'danger'>('profile');
  // Flag: administratorul a resetat parola — user trebuie să o schimbe
  const [passwordResetRequired, setPasswordResetRequired] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  // Verifica daca parola a fost resetata de admin (din localStorage sau backend)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored?.passwordResetRequired) {
      setPasswordResetRequired(true);
      setActiveSection('password'); // deschide automat sectiunea schimbare parola
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.email) { showToast('Please fill in required fields.'); return; }
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    setProfileLoading(true);
    try {
      await apiClient.put('/users/me', { fullName, email: form.email });
      // Sync localStorage
      const currentStored = authService.getCurrentUser();
      if (currentStored) {
        const updated = { ...currentStored, fullName, email: form.email };
        localStorage.setItem('user_info', JSON.stringify(updated));
        // Sync AuthContext so navbar updates instantly
        if (setUser) {
          setUser(prev => prev ? { ...prev, name: fullName, email: form.email } : prev);
        }
      }
      showToast('✓ Profile saved successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to save profile.';
      showToast(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Daca parola a fost resetata de admin, parola curenta este cea temporara
    const currentPwdToCheck = pwForm.current;
    if (!currentPwdToCheck) {
      showToast(passwordResetRequired
        ? 'Introdu parola temporară: ResetPass@2026'
        : 'Enter your current password.');
      return;
    }
    if (pwForm.next.length < 8) { showToast('New password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { showToast('Passwords do not match.'); return; }

    setPwLoading(true);
    try {
      await authService.changePassword(currentPwdToCheck, pwForm.next);
      // Actualizeaza localStorage — sterge flag-ul
      const stored = authService.getCurrentUser();
      if (stored) {
        localStorage.setItem('user_info', JSON.stringify({ ...stored, passwordResetRequired: false }));
      }
      setPasswordResetRequired(false);
      showToast('✓ Password updated successfully!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to update password. Check your current password.';
      showToast(msg);
    } finally {
      setPwLoading(false);
    }
  };

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase();

  return (
    <main className="ep-page">
      <div className="container ep-wrap">

        {/* Banner resetare parolă — afișat dacă adminul a resetat parola */}
        {passwordResetRequired && (
          <div className="ep-reset-banner">
            <span className="ep-reset-banner__icon">⚠️</span>
            <div>
              <strong>Parola ta a fost resetată de administrator.</strong>
              <p>Te rugăm să îți schimbi parola acum. Folosește parola temporară <code>ResetPass@2026</code> ca parolă curentă și setează una nouă mai jos.</p>
            </div>
            <button className="ep-reset-banner__btn" onClick={() => setActiveSection('password')}>
              Schimbă parola →
            </button>
          </div>
        )}

        {/* Sidebar */}
        <aside className="ep-sidebar">
          <div className="ep-avatar">{initials || user.name.charAt(0).toUpperCase()}</div>
          <div className="ep-sidebar__name">{form.firstName} {form.lastName}</div>
          <div className="ep-sidebar__role">{user.role}</div>

          <nav className="ep-nav">
            <button className={`ep-nav__link ${activeSection === 'profile' ? 'ep-nav__link--active' : ''}`} onClick={() => setActiveSection('profile')}>Edit Profile</button>
            <button className={`ep-nav__link ${activeSection === 'password' ? 'ep-nav__link--active' : ''}`} onClick={() => setActiveSection('password')}>
              Change Password
              {passwordResetRequired && <span className="ep-nav__badge">!</span>}
            </button>
            <Link to="/watchlist?filter=my-bids" className="ep-nav__link">My Bids</Link>
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
                <button type="submit" className="ep-save-btn" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {/* Password form */}
          {activeSection === 'password' && (
            <div className="ep-section">
              <h2 className="ep-section__title">
                {passwordResetRequired ? '🔑 Schimbă Parola — Obligatoriu' : 'Change Password'}
              </h2>
              {passwordResetRequired && (
                <p style={{ fontSize: 13.5, color: 'var(--rust)', marginBottom: 18, lineHeight: 1.6 }}>
                  Contul tău are o parolă temporară setată de administrator. Introdu <strong>ResetPass@2026</strong> ca parolă curentă și alege o parolă nouă.
                </p>
              )}
              <form onSubmit={handlePassword} noValidate>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="current">
                    {passwordResetRequired ? 'Parolă Temporară' : 'Current Password'}
                  </label>
                  <input
                    id="current"
                    type={showPasswords ? "text" : "password"}
                    className="ep-input"
                    value={pwForm.current}
                    onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                    placeholder={passwordResetRequired ? 'ResetPass@2026' : '••••••••'}
                    style={{ paddingRight: '40px' }}
                  />
                  <button type="button" className="ep-pwd-toggle" onClick={() => setShowPasswords(!showPasswords)} tabIndex={-1}>
                    {showPasswords ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                <div className="ep-form-row">
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="next">New Password</label>
                    <input id="next" type={showPasswords ? "text" : "password"} className="ep-input" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} placeholder="Min. 8 characters" style={{ paddingRight: '40px' }} />
                    <button type="button" className="ep-pwd-toggle" onClick={() => setShowPasswords(!showPasswords)} tabIndex={-1}>
                      {showPasswords ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>
                  <div className="ep-field">
                    <label className="ep-label" htmlFor="confirm">Confirm New Password</label>
                    <input id="confirm" type={showPasswords ? "text" : "password"} className="ep-input" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat" style={{ paddingRight: '40px' }} />
                    <button type="button" className="ep-pwd-toggle" onClick={() => setShowPasswords(!showPasswords)} tabIndex={-1}>
                      {showPasswords ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="ep-save-btn ep-save-btn--ghost" disabled={pwLoading}>
                  {pwLoading ? 'Se actualizează...' : 'Update Password'}
                </button>
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