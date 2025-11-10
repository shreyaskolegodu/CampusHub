import React, { useEffect, useState } from "react";
import "./Notices.css";
import { api } from "../lib/api";
import { useToasts } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToasts();
  const { isAuthed } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  return (
    <div className="notices-container">
      <h2>📢 Campus Notices</h2>
      {isAuthed && (
        <div className="notices-actions">
          <button onClick={() => setOpen(true)} className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: 8 }}>+ Add Notice</button>
        </div>
      )}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">New Notice</h3>
            <label htmlFor="n-title">Title</label>
            <input id="n-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label htmlFor="n-desc">Description</label>
            <textarea id="n-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="modal-actions">
              <button onClick={() => setOpen(false)} className="btn btn-muted">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    const created = await api.post('/api/notices', { title, description });
                    setNotices((prev) => [{ id: created.id, title: created.title, date: created.date, description: created.description }, ...prev]);
                    setTitle(""); setDescription(""); setOpen(false);
                    addToast({ type: 'success', message: 'Notice posted' });
                  } catch (err) {
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
        {notices.map((notice) => (
          <div key={notice.id} className="notice-card">
            <h3>{notice.title}</h3>
            <p className="date">{notice.date}</p>
            <p>{notice.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notices;
