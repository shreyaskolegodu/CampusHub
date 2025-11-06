import React from 'react';
import { useToasts } from '../context/ToastContext';

const typeToBg = {
  success: '#16a34a',
  error: '#dc2626',
  info: '#2563eb',
  warning: '#d97706',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToasts();
  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 9999,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          backgroundColor: typeToBg[t.type] || typeToBg.info,
          color: 'white',
          padding: '10px 12px',
          borderRadius: 8,
          minWidth: 220,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}
            >×</button>
          </div>
        </div>
      ))}
    </div>
  );
}


