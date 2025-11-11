import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import Search from '../components/Search';
import './Resources.css';

function Resources() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.get('/api/resources');
        setResources(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    fetchResources();
    const onAdded = () => fetchResources();
    window.addEventListener('resource:added', onAdded);
    return () => window.removeEventListener('resource:added', onAdded);
  }, []);

  const filteredResources = resources.filter(resource =>
    (resource.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileLink = useCallback((url) => {
    if (!url) return '#';
    // if absolute URL
    if (/^https?:\/\//i.test(url)) return url;
    // if starts with /uploads or uploads
    const base = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
    if (url.startsWith('/')) return `${base}${url}`;
    return `${base}/${url}`;
  }, []);

  return (
    <div className="resources-container">
      <h2 style={{ textAlign: 'center' }}>📚 Study Resources</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Search onSearch={setSearchTerm} />
      </div>
      <div className="resources-grid">
        {filteredResources.map(r => (
          <div key={r.id} className="resource-card">
            <div className="resource-left">
              <div className="resource-title">{r.title}</div>
              <div className="resource-meta">{r.contributor || 'Anonymous'}</div>
              <div className="resource-filename">{r.url ? (r.url.split('/').pop()) : ''}</div>
            </div>
            <div className="resource-actions">
              <a className="btn btn-muted" href={getFileLink(r.url)} target="_blank" rel="noreferrer" download>Open / Download</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;
