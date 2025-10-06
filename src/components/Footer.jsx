import React, { useMemo, useState, useEffect } from 'react';
import './Footer.css';
import { createI18n } from '../i18n/translations';
import { useIntersectionFadeIn } from '../hooks/useIntersectionFadeIn';

const AUTHORS = 'Juan Sebastian Rios Altamitano & Jhonatan Velasco';

const Footer = ({ lang: propLang }) => {
  const [lang, setLang] = React.useState(() => propLang || localStorage.getItem('ui_lang') || 'es');
  const t = useMemo(()=>createI18n(lang), [lang]);
  const { ref, visible } = useIntersectionFadeIn({ threshold: 0.1, rootMargin: '100px' });
  
  // Escuchar cambios de idioma
  React.useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem('ui_lang');
      if (newLang && newLang !== lang) {
        setLang(newLang);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // También escuchar un evento personalizado para cambios en la misma pestaña
    window.addEventListener('language:changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('language:changed', handleStorageChange);
    };
  }, [lang]);
  
  return (
    <footer className="app-footer" role="contentinfo" ref={ref}>
      <div className={`footer-inner ${visible ? 'fade-in-visible' : 'fade-in-hidden'}`}>
        <p className="footer-title">{t('footer_project')}</p>
        <p className="footer-authors">{t('footer_made_by',{ authors: AUTHORS })}</p>
        <p className="footer-meta">{t('footer_meta')}</p>
        <div className="footer-links">
          <a href="#" className="footer-link">
            {t('footer_contact')}
          </a>
          <a href="#" className="footer-link">
            {t('footer_about')}
          </a>
          <a href="#" className="footer-link">
            {t('footer_privacy')}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;