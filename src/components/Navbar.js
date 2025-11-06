import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = () => setMenuOpen((v) => !v);

  const close = () => setMenuOpen(false);

  const activeClassName = ({ isActive }) => (isActive ? "active" : undefined);
  const { isAuthed, user, logout } = useAuth();
  const { addToast } = useToasts();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className={`navbar${menuOpen ? " open" : ""}`}>
      <h1 className="logo">CampusHub</h1>
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={toggle}
      >
        ☰
      </button>
      <ul id="primary-navigation" className={`nav-links${menuOpen ? " show" : ""}`} onClick={close}>
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
            <button onClick={(e)=>{ e.stopPropagation(); setProfileOpen((v)=>!v); }} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}>
              {user?.name || user?.email}
            </button>
            {profileOpen && (
              <div style={{ position:'absolute', right:0, top:'100%', background:'#fff', color:'#111', borderRadius:8, boxShadow:'0 8px 20px rgba(0,0,0,0.2)', padding:8, minWidth:160 }}>
                <button onClick={()=>{ logout(); addToast({ type:'success', message:'Logged out' }); }} style={{ width:'100%', background:'transparent', border:'none', textAlign:'left', padding:'8px 10px', cursor:'pointer' }}>Logout</button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
