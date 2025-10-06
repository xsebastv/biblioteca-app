import React, { useMemo } from 'react';
import './Footer.css';
import { createI18n } from '../i18n/translations';

const AUTHORS = 'Juan Sebastian Rios Altamitano & Jhonatan Velasco';

const Footer = ({ lang = localStorage.getItem('ui_lang') || 'es' }) => {
  const t = useMemo(()=>createI18n(lang), [lang]);
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-inner">
        <p className="footer-title">{t('footer_project')}</p>
        <p className="footer-authors">{t('footer_made_by',{ authors: AUTHORS })}</p>
        <p className="footer-meta">{t('footer_meta')}</p>
      </div>
    </footer>
  );
};

export default Footer;