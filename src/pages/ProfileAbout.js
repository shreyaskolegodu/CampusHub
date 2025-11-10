import React, { useEffect, useState } from 'react';
import './ProfileAbout.css';
import { api } from '../lib/api';
import { useToasts } from '../context/ToastContext';

export default function ProfileAbout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const { addToast } = useToasts();

  useEffect(() => {
    let mounted = true;
    api.get('/api/me').then((data) => { if (mounted) setProfile(data); }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // file upload removed; functions cleaned up to avoid unused warnings

  if (loading) return <div className="page-container">Loading…</div>;

  return (
    <div className="page-container">
      <div className="card profile-card profile-about">
        <h2>About You</h2>
        <div className="profile-top">
          <div className="profile-info">
            <h3 className="profile-name">{profile?.name}</h3>
            <p className="profile-username">Username: {profile?.username || profile?.email}</p>
            <p className="profile-email">{profile?.email}</p>
            <p className="profile-meta">Semester: {profile?.semester || '—'} | SRN: {profile?.srn || '—'}</p>
          </div>
        </div>

        <hr />

          <div className="info-section">
          <label htmlFor="about-srn">SRN</label>
          <input id="about-srn" value={profile?.srn||''} onChange={(e)=>setProfile(p => ({ ...p, srn: e.target.value }))} />

          <label htmlFor="about-semester">Semester</label>
          <input id="about-semester" value={profile?.semester||''} onChange={(e)=>setProfile(p => ({ ...p, semester: e.target.value }))} />

          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={async () => {
              const payload = { srn: profile?.srn || '', semester: profile?.semester || '' };
              const hostsToTry = [];
              if (process.env.REACT_APP_API_BASE_URL) hostsToTry.push(process.env.REACT_APP_API_BASE_URL);
              if (typeof window !== 'undefined') {
                hostsToTry.push(`${window.location.protocol}//${window.location.hostname}:4000`);
              }
              hostsToTry.push('http://localhost:4000');
              hostsToTry.push('http://127.0.0.1:4000');

              let lastErr = null;
              setUploading(true);
              for (const base of hostsToTry) {
                const url = `${base.replace(/\/$/, '')}/api/me`;
                console.log('Attempting to save profile to', url);
                try {
                  const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    credentials: 'include',
                  });
                  if (!res.ok) {
                    const text = await res.text().catch(() => null);
                    const msg = text || res.statusText || `Save failed (${res.status})`;
                    throw new Error(msg);
                  }
                  const updated = await res.json().catch(() => null);
                  if (updated) setProfile(updated);
                  addToast({ type: 'success', message: 'Profile info saved' });
                  lastErr = null;
                  break;
                } catch (err) {
                  console.warn('Save attempt failed for', url, err?.message || err);
                  lastErr = err;
                  // try next host
                }
              }
              if (lastErr) {
                console.error('All save attempts failed', lastErr);
                addToast({ type: 'error', message: lastErr?.message || 'Save failed (network)' });
              }
              setUploading(false);
            }}>{uploading ? 'Saving…' : 'Save Info'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
