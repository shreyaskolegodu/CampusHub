const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Notice = require('./models/Notice');
const Resource = require('./models/Resource');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Contact = require('./models/Contact');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    // Allow same-origin/non-browser (no Origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));

// Ensure preflight is handled for all routes (Express 5 compatible)
app.options(/.*/, cors(corsOptions));

// Basic request logger (dev aid)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
app.use(express.json());
app.use(cookieParser());

// Mongo connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campushub';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

async function requireAuth(req, res, next) {
  const sid = req.cookies.sid;
  if (!sid) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findOne({ sid });
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  req.user = user;
  next();
}

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const sid = `sid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const user = await User.create({ name, email, passwordHash, sid });
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const sid = `sid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    user.sid = sid;
    await user.save();
    res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const sid = req.cookies.sid;
    if (sid) {
      const user = await User.findOne({ sid });
      if (user) {
        user.sid = null;
        await user.save();
      }
    }
    res.clearCookie('sid');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Current user (profile) endpoints
app.get('/api/me', requireAuth, async (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, username: u.username, srn: u.srn, semester: u.semester, avatarUrl: u.avatarUrl });
});

app.post('/api/me', requireAuth, async (req, res) => {
  try {
    const { name, username, srn, semester, avatarUrl } = req.body || {};
    const u = req.user;
    if (typeof name !== 'undefined') u.name = name;
    if (typeof username !== 'undefined') u.username = username;
    if (typeof srn !== 'undefined') u.srn = srn;
    if (typeof semester !== 'undefined') u.semester = semester;
    if (typeof avatarUrl !== 'undefined') u.avatarUrl = avatarUrl;
    await u.save();
    res.json({ id: u._id, name: u.name, email: u.email, username: u.username, srn: u.srn, semester: u.semester, avatarUrl: u.avatarUrl });
  } catch (e) {
    console.error('Error saving /api/me', e);
    res.status(500).json({ message: 'Could not save profile' });
  }
});

// Notices
app.get('/api/notices', async (req, res) => {
  const items = await Notice.find().sort({ createdAt: -1 }).lean();
  res.json(items.map(n => ({ id: n._id, title: n.title, date: n.date, description: n.description })));
});

app.post('/api/notices', requireAuth, async (req, res) => {
  const { title, date, description } = req.body || {};
  if (!title || !description) return res.status(400).json({ message: 'Missing fields' });
  const doc = await Notice.create({ title, date: date || new Date().toDateString(), description, authorId: req.user._id });
  res.status(201).json({ id: doc._id, title: doc.title, date: doc.date, description: doc.description });
});

// Resources
app.get('/api/resources', async (req, res) => {
  const items = await Resource.find().sort({ createdAt: -1 }).lean();
  res.json(items.map(r => ({ id: r._id, title: r.title, url: r.url })));
});

app.post('/api/resources', requireAuth, async (req, res) => {
  const { title, url } = req.body || {};
  if (!title || !url) return res.status(400).json({ message: 'Missing fields' });
  const doc = await Resource.create({ title, url, authorId: req.user._id });
  res.status(201).json({ id: doc._id, title: doc.title, url: doc.url });
});

// Forum posts
app.get('/api/forum', async (req, res) => {
  const items = await Post.find().sort({ createdAt: -1 }).lean();
  res.json(items.map(p => ({ id: p._id, title: p.title, body: p.body, author: p.authorName, createdAt: p.createdAt })));
});

app.post('/api/forum', requireAuth, async (req, res) => {
  const { title, body } = req.body || {};
  if (!title || !body) return res.status(400).json({ message: 'Missing fields' });
  const doc = await Post.create({ title, body, authorId: req.user._id, authorName: req.user.name });
  res.status(201).json({ id: doc._id, title: doc.title, body: doc.body, author: doc.authorName, createdAt: doc.createdAt });
});

// Contact endpoint (simple collector)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ message: 'Missing fields' });
  // For now we just log; swap for email or DB collection as needed
  console.log('Contact message:', { name, email, message });
  res.json({ ok: true });
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/forum/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json({ id: post._id, title: post.title, body: post.body, author: post.authorName, createdAt: post.createdAt });
});

// Comments
app.get('/api/forum/:id/comments', async (req, res) => {
  const items = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 }).lean();
  res.json(items.map(c => ({ id: c._id, body: c.body, author: c.authorName, createdAt: c.createdAt })));
});

app.post('/api/forum/:id/comments', requireAuth, async (req, res) => {
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ message: 'Missing fields' });
  const doc = await Comment.create({ postId: req.params.id, body, authorId: req.user._id, authorName: req.user.name });
  res.status(201).json({ id: doc._id, body: doc.body, author: doc.authorName, createdAt: doc.createdAt });
});

// File upload
app.post('/api/upload', requireAuth, upload.single('file'), async (req, res) => {
  res.json({ path: req.file.path });
});

// Contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ message: 'Missing fields' });
  await Contact.create({ name, email, message });
  res.status(201).json({ message: 'Message received!' });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


