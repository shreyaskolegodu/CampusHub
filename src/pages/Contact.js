import React, { useState } from 'react';
import { api } from '../lib/api';
import './Contact.css';
import { useToasts } from '../context/ToastContext';
import { motion } from 'framer-motion';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    (async () => {
      setLoading(true);
      try {
        await api.post('/api/contact', form);
        addToast({ type: 'success', message: 'Message sent!' });
        setForm({ name: '', email: '', message: '' });
        setErrors({});
      } catch (err) {
        addToast({ type: 'error', message: err?.message || 'Send failed' });
      } finally {
        setLoading(false);
      }
    })();
  };

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Please enter your name';
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!form.email || !emailRe.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.message || !form.message.trim()) e.message = 'Please enter a message';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <motion.div className="contact-container" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.36 }}>
      <div className="contact-card">
        <h2>📞 Contact Us</h2>
        <form onSubmit={handleSubmit} noValidate>

          <label htmlFor="c-name">Your Name</label>
          <div className="field">
            <span className="icon" aria-hidden>
              {/* user icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <input id="c-name" type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} aria-invalid={!!errors.name} />
          </div>
          {errors.name && <div className="field-error">{errors.name}</div>}

          <label htmlFor="c-email">Your Email</label>
          <div className="field">
            <span className="icon" aria-hidden>
              {/* email icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5l9 6 9-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 19H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <input id="c-email" type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} aria-invalid={!!errors.email} />
          </div>
          {errors.email && <div className="field-error">{errors.email}</div>}

          <label htmlFor="c-msg">Your Message</label>
          <div className="field textarea-field">
            <span className="icon" aria-hidden>
              {/* message icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <textarea id="c-msg" name="message" placeholder="Your Message" value={form.message} onChange={handleChange} rows="4" aria-invalid={!!errors.message}></textarea>
          </div>
          {errors.message && <div className="field-error">{errors.message}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" aria-hidden="true"></span> : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

export default Contact;
