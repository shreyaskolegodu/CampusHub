import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useToasts } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { addToast } = useToasts();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const data = await api.post('/api/auth/login', { email, password });
        login(data);
        addToast({ type: 'success', message: 'Logged in successfully' });
        navigate('/');
      } catch (err) {
        addToast({ type: 'error', message: err?.message || 'Login failed' });
      }
    })();
  };

  return (
    <div className="auth-layout">
      <div className="auth-hero">
        <h1>Welcome back to <span>CampusHub</span></h1>
        <p>Pick up where you left off — access notices, discuss with peers, and find study resources in one place.</p>
      </div>
      <div className="auth-container">
        <h2>Login to CampusHub</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>Don’t have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}

export default Login;
