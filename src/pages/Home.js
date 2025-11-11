import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import "./Home.css";
import { api } from '../lib/api';

function Home() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/notices');
        if (!mounted) return;
        // take 3 latest
        setNotices((Array.isArray(data) ? data : []).slice(0, 3));
      } catch (err) {
        console.warn('Failed to load notices', err?.message || err);
      } finally {
        if (mounted) setLoadingNotices(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const featureCards = [
    { id: 'notices', title: 'Notices', icon: '📢', desc: 'Stay updated with college announcements and events.', to: '/notices' },
    { id: 'forum', title: 'Forum', icon: '💬', desc: 'Discuss topics, ask questions, and interact with peers.', to: '/forum' },
    { id: 'resources', title: 'Resources', icon: '📚', desc: 'Access and share study materials and guides.', to: '/resources' },
    { id: 'upload', title: 'Upload', icon: '⬆️', desc: 'Contribute materials to help others in the community.', to: '/upload' },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-title">Welcome to <span>CampusHub</span></h1>
          <p className="hero-sub">Stay connected with your campus community — share ideas, find notices, and access study resources all in one place.</p>
          <button
            className="hero-btn hero-cta"
            onClick={() => { navigate('/register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >Join Now</button>
        </div>
      </section>

      {/* Explore Section */}
      <section className="features">
        <h2 className="section-title">Explore CampusHub</h2>
        <div className="feature-grid">
          {featureCards.map((c) => (
            <motion.div
              key={c.id}
              className="feature-card interactive"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.36 }}
              onClick={() => navigate(c.to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(c.to); }}
            >
              <div className="card-icon" aria-hidden>
                <span className="icon-emoji">{c.icon}</span>
              </div>
              <h3>{c.title}</h3>
              <p className="muted-desc">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Notices */}
      <section className="updates recent-notices">
        <h2 className="section-title">Recent Notices</h2>
        {loadingNotices ? (
          <div className="notice-loading">Loading notices…</div>
        ) : (
          <div className="notice-list">
            {notices.length === 0 ? (
              <div className="notice-empty">No recent notices.</div>
            ) : (
              notices.map((n) => (
                <motion.div key={n.id || n._id} className="notice-card" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.28 }} onClick={() => navigate('/notices')}>
                  <h3>{n.title}</h3>
                  <p className="date">{new Date(n.date || n.createdAt || n.created_at || Date.now()).toLocaleString()}</p>
                  <p className="notice-desc">{n.description && n.description.length > 180 ? n.description.slice(0, 180) + '…' : n.description}</p>
                </motion.div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 CampusHub | Created by Students, for Students</p>
      </footer>
    </div>
  );
}

export default Home;
