import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import { useToasts } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [Container, setContainer] = useState('div'); // motion container or fallback

  const { addToast } = useToasts();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Try to load framer-motion for a nice fade-in. If not available, fall back to a div with CSS animation.
    let mounted = true;
    (async () => {
      try {
        const fm = await import('framer-motion');
        if (!mounted) return;
        setContainer(() => fm.motion.div);
      } catch (e) {
        // framer-motion not installed; fall back
        setContainer(() => 'div');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const validate = () => {
    const e = {};
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Please enter your password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      login(data);
      addToast({ type: 'success', message: 'Logged in successfully' });
      navigate('/');
    } catch (err) {
      const message = (err && (err.status === 401 || /invalid credentials/i.test(err.message || '')))
        ? 'Invalid email or password' : (err?.message || 'Login failed');
      addToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };



  const C = Container || 'div';

  return (
    <C className="auth-layout fade-in">
      <div className="auth-hero">
        <h1>Welcome back to <span>CampusHub</span></h1>
        <p>Pick up where you left off — access notices, discuss with peers, and find study resources in one place.</p>
      </div>

      <div className="auth-container login-centered">
        <h2>Login to CampusHub</h2>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}

          <label htmlFor="login-password">Password</label>
          <div className="password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
              aria-invalid={!!errors.password}
            />
            <button type="button" className="eye-btn" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(s => !s)}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6 0-10-8-10-8a19.5 19.5 0 0 1 4.55-6.14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          </div>
          {errors.password && <div className="field-error">{errors.password}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="btn-spinner" aria-hidden="true"></span> : 'Login'}
          </button>

          {/* alternate actions could go here (e.g., forgot password) */}
        </form>

        <p>Don’t have an account? <Link to="/register">Register here</Link></p>
      </div>
    </C>
  );
}
