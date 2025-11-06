import React, { useState, useEffect } from 'react';
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
  }, []);

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="resources-container">
      <h2 style={{ textAlign: 'center' }}>📚 Study Resources</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <Search onSearch={setSearchTerm} />
      </div>
      <div className="resources-grid">
        {filteredResources.map(r => (
          <div key={r.id} className="resource-card">
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resources;
