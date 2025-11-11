import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useToasts } from '../context/ToastContext';
import { api } from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const { addToast } = useToasts();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!menuOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // small helper for avatar initial
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      // call backend logout if available
      await api.post('/api/logout').catch(() => {});
    } catch (e) {}
    logout();
    addToast({ type: 'success', message: 'Logged out' });
    setMenuOpen(false);
    navigate('/login');
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  const activeClassName = ({ isActive }) => (isActive ? 'active' : undefined);

  return (
    <nav className="navbar">
      <div className="brand-wrap">
        <button className="brand-btn" aria-label="Home" onClick={() => navigate('/') }>
          {/* Minimal transparent SVG logo that adapts to theme */}
          <svg className="brand-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 12c1.2-2 3-3 6-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="brand-text">CampusHub</span>
      </div>

      <ul className="nav-links">
        <li><NavLink to="/" className={activeClassName} end>Home</NavLink></li>
        <li><NavLink to="/notices" className={activeClassName}>Notices</NavLink></li>
        <li><NavLink to="/forum" className={activeClassName}>Forum</NavLink></li>
        <li><NavLink to="/resources" className={activeClassName}>Resources</NavLink></li>
        <li><NavLink to="/contact" className={activeClassName}>Contact</NavLink></li>
      </ul>

      <div className="nav-actions">
        <button className="icon-btn header-theme" onClick={() => toggleTheme()} aria-label="Toggle theme">{theme === 'dark' ? '🌙' : '☀️'}</button>

        {!isAuthed ? (
          <>
            <NavLink to="/login" className="btn btn-link">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary">Register</NavLink>
          </>
        ) : (
          <div className="user-wrap">
            <button ref={btnRef} className="user-button" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <span className="avatar-circle" aria-hidden>{initial}</span>
              <span className="user-name-header">{user?.name || user?.email}</span>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="user-dropdown"
                  ref={dropdownRef}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  transition={{ duration: 0.16 }}
                >
                  <div className="user-info">
                    <div className="avatar-circle large">{initial}</div>
                    <div className="user-meta">
                      <div className="user-name">{user?.name || user?.email}</div>
                      <div className="user-email">{user?.email}</div>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-actions">
                    <NavLink to="/profile/about" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                      <span className="item-icon" aria-hidden>👤</span>
                      <span>View Profile</span>
                    </NavLink>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <span className="item-icon" aria-hidden>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="dropdown-footer">
                    <button className="dropdown-item theme-toggle" onClick={() => toggleTheme()}>
                      <span className="item-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
                      <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
}
