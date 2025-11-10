import React, { useEffect, useState } from 'react';
import './Home.css';
import { api } from '../lib/api';
import { useToasts } from '../context/ToastContext';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToasts();

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
    } catch (e) {
      addToast({ type: 'error', message: 'Could not save profile' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-container">Loading profile…</div>;
  return (
    <div className="page-container">
      <div className="card profile-card">
        <h2>Your Profile</h2>
        <form className="profile-form" onSubmit={(e)=>{ e.preventDefault(); save(); }}>
          <label htmlFor="profile-username">Username</label>
          <input id="profile-username" value={profile?.email || profile?.username || ''} disabled />

          <label htmlFor="profile-name">Full name</label>
          <input id="profile-name" value={profile?.name||''} onChange={(e)=>handleChange('name', e.target.value)} />

          <label htmlFor="profile-srn">SRN</label>
          <input id="profile-srn" value={profile?.srn||''} onChange={(e)=>handleChange('srn', e.target.value)} />

          <label htmlFor="profile-semester">Semester</label>
          <input id="profile-semester" value={profile?.semester||''} onChange={(e)=>handleChange('semester', e.target.value)} />

          <label htmlFor="profile-bio">Short bio</label>
          <textarea id="profile-bio" value={profile?.bio||''} onChange={(e)=>handleChange('bio', e.target.value)} />

          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
