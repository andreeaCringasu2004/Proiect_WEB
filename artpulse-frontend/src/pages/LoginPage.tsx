import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../context/AuthContext';
import './AuthPages.css';

interface LoginPageProps {
  onLogin?: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
      // TODO: replace with real API call
      // const res = await authService.login(form.email, form.password);
      // onLogin?.(res.user);
      // navigate('/auctions');

      // Demo only
      await new Promise(r => setTimeout(r, 900));
      onLogin?.({ name: 'Demo User', role: 'bidder' });
      navigate('/auctions');
    } catch {
      setError('Invalid email or password.');
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