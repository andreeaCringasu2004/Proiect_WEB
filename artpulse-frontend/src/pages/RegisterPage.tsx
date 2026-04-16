import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../context/AuthContext';
import './AuthPages.css';

type Role = 'bidder' | 'seller' | 'admin' | 'expert';

interface RegisterPageProps {
  onLogin?: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'bidder' as Role,
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'bidder' as Role,
      agreeTerms: false,
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!form.email.includes('@')) errs.email = 'Please enter a valid email.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the terms.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      onLogin?.({ name: `${form.firstName} ${form.lastName}`, role: form.role as 'bidder' | 'seller' | 'admin' | 'expert' });
      navigate('/auctions');
    } catch {
      setErrors({ form: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-page__form-panel">
        <div className="auth-page__form-inner animate-fade-up">
          <Link to="/" className="auth-page__back">← Back to ArtPulse</Link>

          <div className="auth-page__logo">
            <div className="auth-page__logo-mark">AP</div>
          </div>

          <h1 className="auth-page__title">Create your account</h1>
          <p className="auth-page__subtitle">Join ArtPulse to bid, sell, and collect exceptional art</p>

          {/* Role selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${form.role === 'bidder' ? 'role-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, role: 'bidder' }))}
            >
              <span className="role-btn__icon">🎯</span>
              <span className="role-btn__label">Bidder</span>
              <span className="role-btn__desc">I want to collect art</span>
            </button>
            <button
              type="button"
              className={`role-btn ${form.role === 'seller' ? 'role-btn--active' : ''}`}
              onClick={() => setForm(f => ({ ...f, role: 'seller' }))}
            >
              <span className="role-btn__icon">🖼️</span>
              <span className="role-btn__label">Seller</span>
              <span className="role-btn__desc">I want to sell my work</span>
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="firstName">First name</label>
                <input
                  id="firstName" name="firstName" type="text"
                  value={form.firstName} onChange={handleChange}
                  className={`auth-field__input ${errors.firstName ? 'auth-field__input--error' : ''}`}
                  placeholder="John"
                />
                {errors.firstName && <span className="auth-field__error">{errors.firstName}</span>}
              </div>
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="lastName">Last name</label>
                <input
                  id="lastName" name="lastName" type="text"
                  value={form.lastName} onChange={handleChange}
                  className={`auth-field__input ${errors.lastName ? 'auth-field__input--error' : ''}`}
                  placeholder="Doe"
                />
                {errors.lastName && <span className="auth-field__error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                className={`auth-field__input ${errors.email ? 'auth-field__input--error' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <span className="auth-field__error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                className={`auth-field__input ${errors.password ? 'auth-field__input--error' : ''}`}
                placeholder="At least 8 characters"
              />
              {errors.password && <span className="auth-field__error">{errors.password}</span>}
            </div>

            <div className="auth-field">
              <label className="auth-field__label" htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                value={form.confirmPassword} onChange={handleChange}
                className={`auth-field__input ${errors.confirmPassword ? 'auth-field__input--error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span className="auth-field__error">{errors.confirmPassword}</span>}
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox" name="agreeTerms"
                checked={form.agreeTerms} onChange={handleChange}
              />
              <span className="auth-checkbox__label">
                I agree to the <Link to="/legal?tab=terms" className="auth-page__switch-link">Terms of Service</Link> and{' '}
                <Link to="/legal?tab=privacy" className="auth-page__switch-link">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeTerms && <span className="auth-field__error">{errors.agreeTerms}</span>}
            {errors.form && <p className="auth-form__error">{errors.form}</p>}

            <button className="auth-form__submit" type="submit" disabled={loading}>
              {loading ? <span className="auth-form__spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-page__switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-page__switch-link">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="auth-page__art-panel">
        <div className="auth-page__art-img" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=1000&q=80')`
        }} />
        <div className="auth-page__art-overlay" />
        <div className="auth-page__art-caption">
          <blockquote className="auth-page__quote">
            "The purpose of art is washing the dust<br />
            of daily life off our souls."
          </blockquote>
          <cite className="auth-page__cite">— Pablo Picasso</cite>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;