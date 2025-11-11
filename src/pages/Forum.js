import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToasts } from '../context/ToastContext';
import { motion } from 'framer-motion';
import './Forum.css';

function Forum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthed } = useAuth();
  const { addToast } = useToasts();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sortMode, setSortMode] = useState('recent'); // recent | popular
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [counts, setCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('forumCounts') || '{}'); } catch(e){ return {}; }
  });
  const [upvotes, setUpvotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('forumUpvotes') || '{}'); } catch(e){ return {}; }
  });

  useEffect(() => {
    api.get('/api/forum')
      .then((data) => {
        setPosts(data);
        setLoading(false);
        // pre-populate counts map with zeros
        const initCounts = {};
        (data || []).forEach(p => { initCounts[p.id || p._id] = 0; });
        setCounts(c => ({ ...initCounts, ...c }));
      })
      .catch((error) => {
        console.error('Error fetching forum posts:', error);
        setError('Failed to load forum posts');
        setLoading(false);
        setPosts([]);
      });
  }, []);

  // persist upvotes and counts
  useEffect(() => { try { localStorage.setItem('forumUpvotes', JSON.stringify(upvotes)); } catch(e){} }, [upvotes]);
  useEffect(() => { try { localStorage.setItem('forumCounts', JSON.stringify(counts)); } catch(e){} }, [counts]);

  // fetch comment counts for posts (lightweight)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = {};
        await Promise.all((posts||[]).map(async p => {
          try {
            const cm = await api.get(`/api/forum/${p.id || p._id}/comments`);
            map[p.id || p._id] = Array.isArray(cm) ? cm.length : 0;
          } catch (e) { map[p.id || p._id] = 0; }
        }));
        if (mounted) setCounts(c => ({ ...c, ...map }));
      } catch (e) { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [posts]);

  const sortedPosts = useMemo(() => {
    const arr = [...posts];
    if (sortMode === 'popular') {
      arr.sort((a,b) => ((upvotes[b.id||b._id]||0) - (upvotes[a.id||a._id]||0)) || ((counts[b.id||b._id]||0) - (counts[a.id||a._id]||0)));
    } else {
      arr.sort((a,b) => new Date(b.createdAt||b.date||0).getTime() - new Date(a.createdAt||a.date||0).getTime());
    }
    return arr;
  }, [posts, sortMode, upvotes, counts]);

  const openThread = async (post) => {
    setSelectedPost(post);
    try {
      const cm = await api.get(`/api/forum/${post.id || post._id}/comments`);
      setComments(Array.isArray(cm) ? cm : []);
    } catch (e) { setComments([]); }
  };

  const closeThread = () => { setSelectedPost(null); setComments([]); setReplyText(''); };

  const vote = (id, delta) => {
    setUpvotes(u => {
      const next = { ...u };
      next[id] = Math.max(0, (next[id]||0) + delta);
      return next;
    });
  };

  const postReply = async () => {
    if (!selectedPost) return;
    if (!replyText.trim()) return addToast({ type: 'error', message: 'Reply cannot be empty' });
    try {
      const created = await api.post(`/api/forum/${selectedPost.id || selectedPost._id}/comments`, { body: replyText });
      setComments(prev => [...prev, created]);
      setReplyText('');
      setCounts(c => ({ ...c, [selectedPost.id || selectedPost._id]: (c[selectedPost.id || selectedPost._id]||0) + 1 }));
      addToast({ type: 'success', message: 'Reply posted' });
    } catch (e) {
      addToast({ type: 'error', message: e?.message || 'Failed to post reply' });
    }
  };

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
      <h2 className="forum-title">💬 Discussion Forum</h2>

      <div className="forum-header-controls">
        <div className="sort-filter">
          <label>Sort:</label>
          <select value={sortMode} onChange={(e)=>setSortMode(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {isAuthed && (
        <div className="forum-composer card">
          <h3 style={{ marginTop:0 }}>Start a discussion</h3>
          <input className="input" type="text" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="textarea" rows={4} placeholder="What's on your mind?" value={body} onChange={(e)=>setBody(e.target.value)} />
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button className="btn btn-muted" onClick={()=>{ setTitle(''); setBody(''); }}>Clear</button>
            <button className="btn btn-primary" onClick={async()=>{
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
        </div>
      )}

      <div className="forum-list">
        {sortedPosts.length === 0 ? (
          <div className="empty">No forum posts yet. Be the first to start a discussion!</div>
        ) : (
          sortedPosts.map((post) => {
            const id = post.id || post._id;
            return (
              <motion.div key={id} className="forum-post card" whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                <div className="post-main" onClick={()=>openThread(post)} role="button" tabIndex={0} onKeyDown={(e)=>{ if (e.key==='Enter') openThread(post); }}>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-meta">By <b>{post.author}</b> • {timeAgo(post.createdAt || post.date)}</p>
                  <p className="post-body-snippet">{post.body && post.body.length > 220 ? post.body.slice(0,220)+'…' : post.body}</p>
                </div>
                <div className="post-actions">
                  <div className="votes">
                    <button className="vote" onClick={()=>vote(id, 1)}>▲</button>
                    <span className="count">{upvotes[id]||0}</span>
                    <button className="vote" onClick={()=>vote(id, -1)}>▼</button>
                  </div>
                  <div className="replies">{counts[id]||0} replies</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Thread modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={closeThread}>
          <motion.div className="modal" onClick={(e)=>e.stopPropagation()} initial={{ scale:0.96, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.18 }}>
            <h3>{selectedPost.title}</h3>
            <p className="post-meta">By <b>{selectedPost.author}</b> • {timeAgo(selectedPost.createdAt || selectedPost.date)}</p>
            <div className="thread-body"><p>{selectedPost.body}</p></div>
            <hr />
            <div className="comments">
              <h4>Replies</h4>
              {comments.length === 0 ? <div className="empty">No replies yet.</div> : (
                comments.map(c => (
                  <div key={c.id || c._id} className="comment">
                    <div className="comment-meta"><b>{c.author || 'Anonymous'}</b> • {timeAgo(c.createdAt)}</div>
                    <div className="comment-body">{c.body}</div>
                  </div>
                ))
              )}

              {isAuthed ? (
                <div className="reply-box">
                  <textarea className="textarea" rows={3} placeholder="Write a reply..." value={replyText} onChange={(e)=>setReplyText(e.target.value)} />
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                    <button className="btn btn-muted" onClick={()=>setReplyText('')}>Clear</button>
                    <button className="btn btn-primary" onClick={postReply}>Reply</button>
                  </div>
                </div>
              ) : <div className="empty">Log in to reply.</div> }

            </div>
            <div style={{ textAlign:'right', marginTop:12 }}>
              <button className="btn btn-muted" onClick={closeThread}>Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Forum;

function timeAgo(input) {
  if (!input) return 'just now';
  const d = new Date(input);
  const diff = Math.floor((Date.now() - d.getTime())/1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
