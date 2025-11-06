import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToasts } from '../context/ToastContext';
import './Forum.css';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthed } = useAuth();
  const { addToast } = useToasts();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/api/forum')
      .then((data) => {
        if (mounted) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching forum posts:', error);
        if (mounted) {
          setError('Failed to load forum posts');
          setLoading(false);
          setPosts([]);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>💬 Discussion Forum</h2>
        <div style={{ marginTop: '30px' }}>Loading forum posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>💬 Discussion Forum</h2>
        <div style={{ marginTop: '30px', color: 'crimson' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <h2 style={{ textAlign:'center' }}>💬 Discussion Forum</h2>
      {isAuthed && (
        <div className="forum-composer">
          <h3 style={{ marginTop:0 }}>Start a discussion</h3>
          <input type="text" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea rows={4} placeholder="What's on your mind?" value={body} onChange={(e)=>setBody(e.target.value)} />
          <button onClick={async()=>{
            if (!title.trim() || !body.trim()) {
              addToast({ type:'error', message:'Title and body are required' });
              return;
            }
            try {
              const created = await api.post('/api/forum', { title, body });
              setPosts((prev)=>[{...created}, ...prev]);
              setTitle(''); setBody('');
              addToast({ type:'success', message:'Posted' });
            } catch (err) {
              addToast({ type:'error', message: err?.message || 'Failed to post' });
            }
          }}>Post</button>
        </div>
      )}
      <div className="forum-list">
        {posts.length === 0 ? (
          <div style={{ color: '#666', textAlign:'center' }}>No forum posts yet. Be the first to start a discussion!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="forum-post">
              <h3>
                <Link to={`/forum/${post.id}`}>{post.title}</Link>
              </h3>
              <p style={{ margin:0 }}>By <b>{post.author}</b></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;
