import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X, Bell, Megaphone } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} color="#4CAF50" />;
      case 'error': return <AlertCircle size={20} color="#F44336" />;
      case 'warning': return <Info size={20} color="#FF9800" />;
      case 'info': return <Megaphone size={20} color="var(--primary)" />;
      default: return <Bell size={20} color="var(--primary)" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', width: 'calc(100% - 40px)', maxWidth: '420px' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="page-transition" style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(12px)',
            borderLeft: `6px solid ${toast.type === 'info' ? 'var(--primary)' : toast.type === 'success' ? '#4CAF50' : '#F44336'}`,
            padding: '16px 20px',
            borderRadius: '20px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: toast.type === 'info' ? 'var(--primary-light)' : toast.type === 'success' ? '#E8F5E9' : '#FFEBEE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                {getIcon(toast.type)}
            </div>
            
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: '800', color: '#111', lineHeight: '1.4' }}>{toast.message}</p>
            </div>

            <button 
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#999', transition: 'all 0.2s' }}
            >
              <X size={14} />
            </button>

            <div style={{ 
                position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'rgba(0,0,0,0.05)', width: '100%' 
            }}>
                <div style={{ 
                    height: '100%', 
                    background: toast.type === 'info' ? 'var(--primary)' : toast.type === 'success' ? '#4CAF50' : '#F44336',
                    animation: 'toastProgress 5s linear forwards'
                }}></div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
