import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../context/AuthContext';
import './AuthPages.css';

import { PREDEFINED_USERS } from '../context/DataContext';

interface LoginPageProps {
  onLogin?: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });

  React.useEffect(() => {
    setForm({ email: '', password: '' });
  }, []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const autofill = (email: string) => {
    setForm({ email, password: 'password123' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));

      const foundUser = PREDEFINED_USERS.find(u => u.email === form.email);
      if (foundUser) {
        onLogin?.(foundUser);

        if (foundUser.role === 'admin') navigate('/admin');
        else if (foundUser.role === 'expert') navigate('/expert/review');
        else if (foundUser.role === 'seller') navigate('/seller/dashboard');
        else navigate('/auctions');
      } else {
        throw new Error('User not found');
      }
    } catch {
      setError('Invalid email or password. Try a demo account below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__art-panel">
        <div className="auth-page__art-img" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1000&q=80')`
        }} />
        <div className="auth-page__art-overlay" />
        <div className="auth-page__art-caption">
          <blockquote className="auth-page__quote">
            "Every artist dips his brush in his own soul,<br />
            and paints his own nature into his pictures."
          </blockquote>
          <cite className="auth-page__cite">— Henry Ward Beecher</cite>
        </div>
      </div>

      <div className="auth-page__form-panel">
        <div className="auth-page__form-inner animate-fade-up">
          <Link to="/" className="auth-page__back">← Back to ArtPulse</Link>

          <div className="auth-page__logo">
            <div className="auth-page__logo-mark">AP</div>
          </div>

          <h1 className="auth-page__title">Welcome back</h1>
          <p className="auth-page__subtitle">Sign in to your ArtPulse account</p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label className="auth-field__label" htmlFor="password">Password</label>
                <a href="#forgot" className="auth-field__forgot">Forgot password?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="auth-field__input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="auth-form__error">{error}</p>}

            <button className="auth-form__submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-form__spinner" /> : 'Sign in'}
            </button>

            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--cream)', borderRadius: '6px', fontSize: '13px' }}>
              <strong>Conturi de Test Preadăugate (Apasă pentru completare automată):</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('admin@artpulse.com'); }} style={{ color: 'var(--ink)' }}>👑 Admin</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('expert1@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🔎 Expert 1 (Evaluare)</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('expert2@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🔎 Expert 2</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('seller1@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🖌️ Seller 1 (Conversații)</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('seller2@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🖌️ Seller 2 (Produse diverse)</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('bidder1@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🔨 Bidder 1</a>
                <a href="#fill" onClick={(e) => { e.preventDefault(); autofill('bidder2@artpulse.com'); }} style={{ color: 'var(--ink)' }}>🔨 Bidder 2</a>
              </div>
            </div>
          </form>

          <div className="auth-page__divider">
            <span>or continue as</span>
          </div>

          <Link to="/auctions" className="auth-page__guest-btn">
            Browse as Guest
          </Link>

          <p className="auth-page__switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-page__switch-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;