import React, { useEffect, useState } from "react";
import "./Notices.css";
import { api } from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { motion } from 'framer-motion';


function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToasts();
  const { isAuthed } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('all'); // all, 1d,7d,30d
  const [filterDept, setFilterDept] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [readSet, setReadSet] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotices') || '[]')); } catch(e){ return new Set(); }
  });
  const [modalNotice, setModalNotice] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/notices');
        if (mounted) setNotices(data);
      } catch (err) {
        setError(err?.message || 'Failed to load notices');
        addToast({ type: 'error', message: 'Failed to load notices' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [addToast]);

  if (loading) {
    return (
      <div className="notices-container">
        <h2>📢 Campus Notices</h2>
        <div>Loading notices…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notices-container">
        <h2>📢 Campus Notices</h2>
        <div style={{ color: 'crimson' }}>{error}</div>
      </div>
    );
  }

  // filtering
  const filtered = notices.filter(n => {
    if (search) {
      const s = search.toLowerCase();
      if (!((n.title||'').toLowerCase().includes(s) || (n.description||'').toLowerCase().includes(s))) return false;
    }
    if (filterDept !== 'all') {
      if ((n.department||'').toLowerCase() !== filterDept.toLowerCase()) return false;
    }
    if (filterDate !== 'all') {
      const created = new Date(n.createdAt || n.date || Date.now());
      const now = Date.now();
      if (filterDate === '1d' && now - created.getTime() > 1000*60*60*24) return false;
      if (filterDate === '7d' && now - created.getTime() > 1000*60*60*24*7) return false;
      if (filterDate === '30d' && now - created.getTime() > 1000*60*60*24*30) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

  const markAsRead = (id) => {
    // If user is authenticated, persist server-side; otherwise use localStorage fallback
    if (isAuthed) {
      (async () => {
        try {
          await api.post(`/api/notices/${id}/read`);
          setNotices(prev => prev.map(n => (String(n.id || n._id) === String(id) ? { ...n, isRead: true } : n)));
        } catch (e) {
          console.warn('Could not mark read server-side', e);
        }
      })();
    } else {
      const s = new Set(readSet);
      s.add(id);
      setReadSet(s);
      try { localStorage.setItem('readNotices', JSON.stringify(Array.from(s))); } catch(e){}
    }
  };

  const toggleUpvote = async (id) => {
    if (!isAuthed) return addToast({ type: 'error', message: 'Log in to upvote' });
    try {
      const res = await api.post(`/api/notices/${id}/upvote`);
      // server returns upvoteCount and upvoted
      setNotices(prev => prev.map(n => (String(n.id || n._id) === String(id) ? { ...n, upvoteCount: res.upvoteCount, isUpvoted: !!res.upvoted } : n)));
    } catch (e) {
      console.error('Upvote failed', e);
      addToast({ type: 'error', message: e?.message || 'Upvote failed' });
    }
  };

  return (
    <div className="notices-container">
      <h2>📢 Campus Notices</h2>
      <div className="notices-controls">
        <input className="search" placeholder="Search notices..." value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} />
        <select value={filterDate} onChange={(e)=>{ setFilterDate(e.target.value); setPage(1); }}>
          <option value="all">All time</option>
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <select value={filterDept} onChange={(e)=>{ setFilterDept(e.target.value); setPage(1); }}>
          <option value="all">All departments</option>
          {/* derive departments from notices */}
          {[...new Set(notices.map(n => n.department).filter(Boolean))].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {isAuthed && (
        <div className="notices-actions">
          <button onClick={() => setOpen(true)} className="btn add-notice-btn" aria-label="Add Notice">+ Add Notice</button>
        </div>
      )}
      {open && (
        <div className="modal-overlay" onClick={() => { setOpen(false); setFile(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">New Notice</h3>
            <label htmlFor="n-title">Title</label>
            <input id="n-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label htmlFor="n-dept">Department (optional)</label>
            <input id="n-dept" type="text" placeholder="e.g., CSE" onChange={(e)=>{ /* store in description or future field */ }} />
            <label htmlFor="n-desc">Description</label>
            <textarea id="n-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            <label htmlFor="n-file">Attachment (image or PDF)</label>
            <input id="n-file" type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files && e.target.files[0])} />
            <div className="modal-actions">
              <button onClick={() => { setOpen(false); setFile(null); }} className="btn btn-muted">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    let attachmentNote = '';
                    if (file) {
                      const fd = new FormData();
                      fd.append('file', file);
                      const up = await fetch((process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '') + '/api/upload', { method: 'POST', body: fd, credentials: 'include' });
                      if (!up.ok) throw new Error('Upload failed');
                      const json = await up.json();
                      const path = json.path || json.filepath || json.filename || json.path;
                      if (path) attachmentNote = `\n\nAttachment: ${path}`;
                    }
                    const payload = { title, description: (description || '') + attachmentNote };
                    const created = await api.post('/api/notices', payload);
                    setNotices((prev) => [{ id: created.id, title: created.title, date: created.date, description: created.description }, ...prev]);
                    setTitle(""); setDescription(""); setFile(null); setOpen(false);
                    addToast({ type: 'success', message: 'Notice posted' });
                  } catch (err) {
                    console.error('Post failed', err);
                    addToast({ type: 'error', message: err?.message || 'Failed to post' });
                  }
                }}
                className="btn btn-primary"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="notices-list">
        {pageItems.map((notice) => (
          <motion.div key={notice.id || notice._id} className={`notice-card ${readSet.has(String(notice.id || notice._id)) ? 'read' : ''}`} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.28 }}>
            <h3>{notice.title}</h3>
            <p className="date">{new Date(notice.date || notice.createdAt || Date.now()).toLocaleString()}</p>
            <p className="notice-snippet">{notice.description && notice.description.length > 160 ? notice.description.slice(0, 160) + '…' : notice.description}</p>
            <div className="notice-actions">
              <button className="btn btn-muted" onClick={() => setModalNotice(notice)}>Read More</button>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={`btn ${notice.isUpvoted ? 'btn-primary' : ''}`} onClick={() => toggleUpvote(String(notice.id || notice._id))}>
                  ▲ {notice.upvoteCount || 0}
                </button>
                <button className="btn" onClick={() => { markAsRead(String(notice.id || notice._id)); }}>{(notice.isRead || readSet.has(String(notice.id || notice._id))) ? 'Marked' : 'Mark as Read'}</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="btn btn-muted" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
        <span className="page-info">Page {page} / {totalPages}</span>
        <button className="btn btn-muted" disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))}>Next</button>
      </div>

      {/* Read more modal */}
      {modalNotice && (
        <div className="modal-overlay" onClick={() => setModalNotice(null)}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <h3>{modalNotice.title}</h3>
            <p className="date">{new Date(modalNotice.date || modalNotice.createdAt || Date.now()).toLocaleString()}</p>
            <div className="modal-body">
              <p>{modalNotice.description}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-muted" onClick={() => setModalNotice(null)}>Close</button>
              <button className="btn" onClick={() => { markAsRead(String(modalNotice.id || modalNotice._id)); setModalNotice(null); }}>Mark as Read</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notices;
