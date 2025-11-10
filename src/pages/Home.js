import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to <span>CampusHub</span></h1>
          <p>
            Stay connected with your campus community — share ideas, find notices,
            and access study resources all in one place.
          </p>
          <Link to="/register" className="hero-btn">Join Now</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Explore CampusHub</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>📢 Notices</h3>
            <p>Stay updated with all college announcements and important events.</p>
          </div>
          <div className="feature-card">
            <h3>💬 Forum</h3>
            <p>Discuss topics, ask questions, and interact with your peers.</p>
          </div>
          <div className="feature-card">
            <h3>📚 Resources</h3>
            <p>Access and share study materials, notes, and guides easily.</p>
          </div>
          <div className="feature-card">
            <h3>⬆️ Upload</h3>
            <p>Contribute your materials to help others in the community.</p>
          </div>
          <div className="feature-card">
            <h3>👤 About Me</h3>
            <p>View and update your profile, upload a profile photo, and manage your public info.</p>
            <Link to="/profile/about" className="hero-btn" style={{ padding: '8px 14px', marginTop: 12, display: 'inline-block' }}>Open Profile</Link>
          </div>
        </div>
      </section>

      {/* Updates Section */}
      <section className="updates">
        <h2>Latest Updates</h2>
        <ul>
          <li>🎓 New discussion on internship experiences!</li>
          <li>🗓️ Mid-semester exams start next week — check the notice board.</li>
          <li>📖 New “Web Tech Notes” added in Resources.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 CampusHub | Created by Students, for Students</p>
      </footer>
    </div>
  );
}

export default Home;
