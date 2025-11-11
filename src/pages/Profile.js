import React, { useEffect, useState } from 'react';
import './Profile.css';
import { api } from '../lib/api';
import { useToasts } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const { addToast } = useToasts();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/api/me').then((data) => {
      if (mounted) setProfile(data);
    }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleChange = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      setSaving(true);
      const updated = await api.post('/api/me', profile);
      setProfile(updated);
      addToast({ type: 'success', message: 'Profile saved' });
      setEditing(false);
    } catch (e) {
      addToast({ type: 'error', message: 'Could not save profile' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-container">Loading profile…</div>;

  const avatarInitial = (profile?.name || profile?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="page-container">
      <motion.div className="card profile-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <div className="profile-top">
          <div className="avatar-large">{avatarInitial}</div>
          <h2>Your Profile</h2>
        </div>

        <form className="profile-form" onSubmit={(e)=>{ e.preventDefault(); save(); }}>
          <div className="field-row">
            <label htmlFor="profile-username">Username</label>
            <input id="profile-username" value={profile?.email || profile?.username || ''} disabled />
          </div>

          <div className="field-row">
            <label htmlFor="profile-name">Full name</label>
            <input id="profile-name" value={profile?.name||''} onChange={(e)=>handleChange('name', e.target.value)} disabled={!editing} />
          </div>

          <div className="field-row two-up">
            <div>
              <label htmlFor="profile-srn">SRN</label>
              <input id="profile-srn" value={profile?.srn||''} onChange={(e)=>handleChange('srn', e.target.value)} disabled={!editing} />
            </div>
            <div>
              <label htmlFor="profile-semester">Semester</label>
              <input id="profile-semester" value={profile?.semester||''} onChange={(e)=>handleChange('semester', e.target.value)} disabled={!editing} />
            </div>
          </div>

          <div className="field-row">
            <label htmlFor="profile-bio">Short bio</label>
            <textarea id="profile-bio" value={profile?.bio||''} onChange={(e)=>handleChange('bio', e.target.value)} disabled={!editing} />
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn save-cta" disabled={saving || !editing}>{saving ? 'Saving…' : 'Save Info'}</button>
          </div>
        </form>

        <div className="account-actions">
          <button className="btn btn-link" onClick={() => setEditing((v)=>!v)}>{editing ? 'Cancel' : 'Edit Info'}</button>
          <button className="btn btn-ghost" onClick={() => { logout(); navigate('/login'); }}>{'Logout'}</button>
        </div>
      </motion.div>
    </div>
  );
}
