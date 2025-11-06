import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../context/AuthContext";
import { useToasts } from "../context/ToastContext";

function Navbar() {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  const close = () => setOpen(false);

  const activeClassName = ({ isActive }) => (isActive ? "active" : undefined);
  const { isAuthed, user, logout } = useAuth();
  const { addToast } = useToasts();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <button onClick={(e)=>{ e.stopPropagation(); setMenuOpen((v)=>!v); }} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}>
              {user?.name || user?.email}
            </button>
            {menuOpen && (
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
