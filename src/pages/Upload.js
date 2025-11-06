import React, { useState } from 'react';
import { api } from '../lib/api';
import './Upload.css';
import { useToasts } from '../context/ToastContext';

function Upload() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { addToast } = useToasts();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/resources', { title, url });
      addToast({ type: 'success', message: 'Resource submitted' });
      setTitle('');
      setUrl('');
    } catch (err) {
      addToast({ type: 'error', message: err?.message || 'Submit failed' });
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>📤 Submit a Resource</h2>
        <p>Share helpful links (notes, articles, videos). Submissions appear in Resources after posting.</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="res-title">Title</label>
          <input id="res-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <label htmlFor="res-url">URL</label>
          <input id="res-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
