import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useToasts } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { addToast } = useToasts();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const data = await api.post('/api/auth/register', { name, email, password });
        login(data);
        addToast({ type: 'success', message: 'Account created successfully' });
        navigate('/');
      } catch (err) {
        addToast({ type: 'error', message: err?.message || 'Registration failed' });
      }
    })();
  };

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <h1>Join <span>CampusHub</span></h1>
        <p>Create an account to get updates, share resources, and collaborate with your campus community.</p>
      </div>
      <div className="auth-container">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;
