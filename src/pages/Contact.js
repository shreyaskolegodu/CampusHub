import React, { useState } from 'react';
import { api } from '../lib/api';
import './Contact.css';
import { useToasts } from '../context/ToastContext';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const { addToast } = useToasts();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/contact', form);
      addToast({ type: 'success', message: 'Message sent!' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      addToast({ type: 'error', message: err?.message || 'Send failed' });
    }
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h2>📞 Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="c-name">Your Name</label>
          <input id="c-name" type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />

          <label htmlFor="c-email">Your Email</label>
          <input id="c-email" type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />

          <label htmlFor="c-msg">Your Message</label>
          <textarea id="c-msg" name="message" placeholder="Your Message" value={form.message} onChange={handleChange} rows="4" required />

          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
