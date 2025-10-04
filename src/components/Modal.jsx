import React, { useEffect } from 'react';

/**
 * Componente Modal - Ventana modal moderna y accesible
 * Utilizado para confirmaciones y diálogos en la aplicación
 * Incluye animaciones, manejo de teclado y accesibilidad mejorada
 */
const Modal = ({ mostrar, onCerrar, titulo, children }) => {
  
  // Manejar tecla Escape y bloquear scroll del body
  useEffect(() => {
    const manejarEscape = (e) => {
      if (e.key === 'Escape' && mostrar) {
        onCerrar();
      }
    };

    if (mostrar) {
      document.addEventListener('keydown', manejarEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', manejarEscape);
      document.body.style.overflow = 'unset';
    };
  }, [mostrar, onCerrar]);

  // No renderizar si no está visible
  if (!mostrar) return null;

  // Manejar clic en el fondo para cerrar
  const manejarClicFondo = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div className="modal-overlay" onClick={manejarClicFondo}>
      <div className="modal-content" role="dialog" aria-labelledby="modal-titulo" aria-modal="true">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 id="modal-titulo" className="modal-title">{titulo}</h2>
          <button className="modal-button cancel" onClick={onCerrar} aria-label="Cerrar modal" type="button">✖</button>
        </div>
        <div style={{ padding: '20px 0' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;