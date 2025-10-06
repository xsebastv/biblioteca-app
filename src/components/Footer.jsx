import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-inner">
        <p className="footer-title">Proyecto Biblioteca Digital</p>
        <p className="footer-authors">Hecho con <span aria-hidden="true">❤</span> por <strong>Juan Sebastian Rios Altamitano</strong> y <strong>Jhonatan Velasco</strong>.</p>
        <p className="footer-meta">2025 · UI clara y alegre · Uso académico</p>
      </div>
    </footer>
  );
};

export default Footer;