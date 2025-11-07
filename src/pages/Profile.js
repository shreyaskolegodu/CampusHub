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
      <div className="card">
        <h2>Your Profile</h2>
        <label>Full name</label>
        <input value={profile?.name||''} onChange={(e)=>handleChange('name', e.target.value)} />
        <label>SRN</label>
        <input value={profile?.srn||''} onChange={(e)=>handleChange('srn', e.target.value)} />
        <label>Semester</label>
        <input value={profile?.semester||''} onChange={(e)=>handleChange('semester', e.target.value)} />
        <label>Short bio</label>
        <textarea value={profile?.bio||''} onChange={(e)=>handleChange('bio', e.target.value)} />
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
        </div>
      </div>
    </div>
  );
}
