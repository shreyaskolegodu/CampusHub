import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, initializing } = useAuth();
  if (initializing) return null;
  return isAuthed ? children : <Navigate to="/login" replace />;
}


