import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";
import { api } from "../lib/api";

function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  const close = () => setOpen(false);

  const activeClassName = ({ isActive }) => (isActive ? "active" : undefined);
  const { isAuthed, user, logout } = useAuth();
  const { addToast } = useToasts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (menuOpen) {
      // fetch the latest profile details when opening the menu
      api.get('/api/me').then((d) => { if (mounted) setProfileDetails(d); }).catch(() => { /* ignore */ });
    }
    return () => { mounted = false; };
  }, [menuOpen]);

  return (
    <nav className={`navbar${open ? " open" : ""}`}>
      <h1 className="logo">CampusHub</h1>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={toggle}
      >
        ☰
      </button>
      <ul id="primary-navigation" className={`nav-links${open ? " show" : ""}`} onClick={close}>
        <li><NavLink to="/" className={activeClassName} end>Home</NavLink></li>
        <li><NavLink to="/notices" className={activeClassName}>Notices</NavLink></li>
        <li><NavLink to="/forum" className={activeClassName}>Forum</NavLink></li>
        <li><NavLink to="/resources" className={activeClassName}>Resources</NavLink></li>
        <li><NavLink to="/upload" className={activeClassName}>Upload</NavLink></li>
        <li><NavLink to="/contact" className={activeClassName}>Contact</NavLink></li>
        {!isAuthed ? (
          <>
            <li><NavLink to="/login" className={activeClassName}>Login</NavLink></li>
            <li><NavLink to="/register" className={activeClassName}>Register</NavLink></li>
          </>
        ) : (
          <li style={{ position:'relative' }}>
            <button onClick={(e)=>{ e.stopPropagation(); setMenuOpen((v)=>!v); }} className="user-button">
              {user?.name || user?.email}
            </button>
            {menuOpen && (
              <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="user-row">
                  <div className="user-avatar">
                    {profileDetails?.avatarUrl ? (
                      <img src={profileDetails.avatarUrl} alt="avatar" />
                    ) : (
                      <div className="user-initial">{(profileDetails?.name || user?.name || user?.email || 'U').charAt(0)}</div>
                    )}
                  </div>
                  <div className="user-meta">
                    <div className="user-name">{profileDetails?.name || user?.name || user?.email}</div>
                    <div className="user-email">{profileDetails?.email || user?.email}</div>
                  </div>
                </div>
                <div className="user-actions">
                  <NavLink to="/profile/about" className="user-action" onClick={() => setMenuOpen(false)}>View Profile</NavLink>
                  <button className="user-action" onClick={() => { logout(); addToast({ type: 'success', message: 'Logged out' }); setMenuOpen(false); }}>Logout</button>
                </div>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
