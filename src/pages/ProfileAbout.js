import React, { useEffect, useState, useRef } from 'react';
import './ProfileAbout.css';
import { api } from '../lib/api';
import { useToasts } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileAbout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const fileRef = useRef(null);
  const { addToast } = useToasts();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    // fetch server profile where available, but allow local overrides from localStorage
    api.get('/api/me').then((data) => { if (mounted) setProfile(data); }).catch(() => {
      // ignore network errors
    }).finally(() => { if (mounted) setLoading(false); });

    // hydrate local edits from localStorage (persisted under 'profile_about')
    try {
      const local = localStorage.getItem('profile_about');
      if (local) {
        const parsed = JSON.parse(local);
        if (mounted) setProfile((p) => ({ ...(p || {}), ...parsed }));
      }
      const av = localStorage.getItem('profile_about_avatar');
      if (av) setAvatarDataUrl(av);
    } catch (e) { /* ignore */ }
    return () => { mounted = false; };
  }, []);

  const onSelectAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const d = reader.result;
      setAvatarDataUrl(d);
      try { localStorage.setItem('profile_about_avatar', d); } catch (e) { /* ignore */ }
    };
    reader.readAsDataURL(file);
  };

  const clearAvatar = () => {
    setAvatarDataUrl(null);
    try { localStorage.removeItem('profile_about_avatar'); } catch (e) {}
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <div className="page-container">Loading…</div>;

  const avatarInitial = (profile?.name || profile?.email || 'U').charAt(0).toUpperCase();

  const handleSaveLocal = async () => {
    setSaving(true);
    try {
      const toSave = {
        srn: profile?.srn || '',
        semester: profile?.semester || '',
        bio: profile?.bio || '',
        name: profile?.name || '',
      };
      localStorage.setItem('profile_about', JSON.stringify(toSave));
      addToast({ type: 'success', message: '✅ Info saved successfully!' });
      setEditing(false);
    } catch (e) {
      addToast({ type: 'error', message: 'Could not save info locally' });
    } finally { setSaving(false); }
  };

  return (
    <div className="page-container">
      <motion.div className="card profile-card profile-about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26 }}>
        <h2>About You</h2>
        <div className="profile-top">
          <div className="avatar-wrap">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="avatar" className="avatar-img avatar-hover" />
            ) : (
              <div className="avatar-placeholder avatar-hover">{avatarInitial}</div>
            )}
            <div className="avatar-controls">
              <input ref={fileRef} type="file" accept="image/*" id="avatar-file" style={{ display: 'none' }} onChange={(e) => onSelectAvatar(e.target.files?.[0])} />
              <button className="btn btn-link small" onClick={() => fileRef.current && fileRef.current.click()}>Upload</button>
              {avatarDataUrl && <button className="btn btn-link small" onClick={clearAvatar}>Remove</button>}
            </div>
          </div>

          <div className="profile-info">
            <h3 className="profile-name">{profile?.name}</h3>
            <p className="profile-username">Username: {profile?.username || profile?.email}</p>
            <p className="profile-email">{profile?.email}</p>
            <div className="accent-line" />
            <p className="profile-meta">Semester: {profile?.semester || '—'} | SRN: {profile?.srn || '—'}</p>
          </div>
        </div>

        <div className="info-section">
          <label htmlFor="about-srn">SRN</label>
          <input id="about-srn" value={profile?.srn||''} onChange={(e)=>setProfile(p => ({ ...p, srn: e.target.value }))} disabled={!editing} />

          <label htmlFor="about-semester">Semester</label>
          <input id="about-semester" value={profile?.semester||''} onChange={(e)=>setProfile(p => ({ ...p, semester: e.target.value }))} disabled={!editing} />

          <label htmlFor="about-bio">Short bio</label>
          <textarea id="about-bio" value={profile?.bio||''} onChange={(e)=>setProfile(p => ({ ...p, bio: e.target.value }))} disabled={!editing} />

          <div className="stats-row">Posts: <strong>12</strong> &nbsp;|&nbsp; Resources Shared: <strong>4</strong></div>

          <div className="actions-row">
            <button className="btn save-cta" onClick={handleSaveLocal} disabled={saving || !editing}>{saving ? 'Saving…' : 'Save Info'}</button>
          </div>
        </div>

        <div className="divider" />

        <div className="account-actions">
          <button className="btn btn-link" onClick={() => setEditing((v)=>!v)}>{editing ? 'Cancel' : 'Edit Info'}</button>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate('/login'); }}>🚪 Logout</button>
          <button className="btn btn-link" onClick={() => navigate('/')}>↩️ Back to Home</button>
        </div>
      </motion.div>
    </div>
  );
}
