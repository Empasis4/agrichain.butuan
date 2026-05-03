import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{title}</h3>
          <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
