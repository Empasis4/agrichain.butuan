import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle size={20} color="var(--primary)" />}
            {toast.type === 'error' && <AlertCircle size={20} color="var(--danger)" />}
            {toast.type === 'warning' && <Info size={20} color="var(--warning)" />}
            <span style={{ fontSize: '0.9rem', fontWeight: '500', flex: 1 }}>{toast.message}</span>
            <X 
              size={16} 
              color="var(--text-muted)" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
