import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'campushub:user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
    setInitializing(false);
  }, []);

  const login = (nextUser) => {
    setUser(nextUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch (_) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const value = useMemo(() => ({ user, initializing, login, logout, isAuthed: !!user }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


