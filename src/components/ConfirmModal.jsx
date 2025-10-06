import React from 'react';
import './ConfirmModal.css';

import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger': return '⚠️';
      case 'warning': return '⚡';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleBackdropClick}>
      <div className="confirm-modal-content" role="dialog" aria-modal="true">
        <div className={`confirm-modal-icon confirm-modal-icon--${type}`}>
          {getIcon()}
        </div>
        
        <div className="confirm-modal-body">
          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-message">{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button 
            className="btn btn-secondary confirm-modal-cancel" 
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>
          <button 
            className={`btn btn-${type} confirm-modal-confirm`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>

        <button 
          className="confirm-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;