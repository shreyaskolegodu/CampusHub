import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = ++idCounter;
    const ttl = toast.durationMs ?? 3000;
    const item = { id, type: toast.type || 'info', message: toast.message, ttl };
    setToasts((prev) => [...prev, item]);
    if (ttl > 0) {
      setTimeout(() => removeToast(id), ttl);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast, toasts }), [addToast, removeToast, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}


