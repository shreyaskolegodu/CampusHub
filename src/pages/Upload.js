import React, { useState } from 'react';
import { api } from '../lib/api';
import './Upload.css';
import { useToasts } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Notes');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      if (!title?.trim()) return addToast({ type: 'error', message: 'Please provide a title' });
      if (!url && !file) return addToast({ type: 'error', message: 'Provide a URL or choose a file to upload' });
      setLoading(true);
      try {
        let resourceUrl = url;
        const base = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          const up = await fetch(`${base.replace(/\/$/, '')}/api/upload`, { method: 'POST', body: fd, credentials: 'include' });
          if (!up.ok) throw new Error('File upload failed');
          const j = await up.json();
          const p = j.path || j.filepath || j.filename || j.path;
          if (!p) throw new Error('Upload response missing path');
          resourceUrl = p.startsWith('/') ? `${base}${p}` : `${base}/${p}`;
        }

        await api.post('/api/resources', { title, url: resourceUrl, category });
        addToast({ type: 'success', message: 'Resource submitted' });
        setTitle(''); setUrl(''); setFile(null);
        try { window.dispatchEvent(new Event('resource:added')); } catch (e) {}
        // short delay so user sees toast, then redirect
        setTimeout(() => navigate('/resources'), 400);
      } catch (err) {
        addToast({ type: 'error', message: err?.message || 'Submit failed' });
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-hero">
          <div className="upload-icon">📤</div>
          <h2>Share a Resource</h2>
          <p className="muted">Add notes, articles, videos, or project links — upload files locally or provide a URL.</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="res-title">Title</label>
          <input id="res-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label htmlFor="res-category">Category</label>
          <select id="res-category" value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option>Notes</option>
            <option>Articles</option>
            <option>Videos</option>
            <option>Projects</option>
          </select>

          <label htmlFor="res-url">URL (optional)</label>
          <input id="res-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />

          <label htmlFor="res-file">Or upload a file (image/pdf)</label>
          <input id="res-file" type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files && e.target.files[0])} />

          <div className="preview">
            <strong>Preview:</strong>
            <div>{file ? file.name : (url ? url : 'Nothing selected')}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-muted" onClick={() => { setTitle(''); setUrl(''); setFile(null); }}>Clear</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" aria-hidden="true"></span> : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload;
