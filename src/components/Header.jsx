import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createI18n } from '../i18n/translations';
import './Header.css';

const Header = ({ favoritesCount = 0, onChangeLang, lang='es' }) => {
  const location = useLocation();
  const t = useMemo(() => createI18n(lang), [lang]);

  const resetLanding = () => {
    localStorage.removeItem('hasVisitedBefore');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            📚
          </div>
          <span>Biblioteca Digital</span>
        </Link>

        <nav className="nav" aria-label="Navegación principal">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>{t('home')}</span>
          </Link>
          <Link 
            to="/favoritos" 
            className={`nav-link ${location.pathname === '/favoritos' ? 'active' : ''}`}
          >
            <span className="nav-icon">❤️</span>
            <span style={{position:'relative', display:'inline-flex', alignItems:'center', gap:4}}>
              {t('favorites')}
              {favoritesCount > 0 && (
                <span className="nav-badge">{favoritesCount}</span>
              )}
            </span>
          </Link>
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginLeft:'0.5rem'}}>
            <button
              onClick={resetLanding}
              title="Ver Landing Page"
              style={{
                padding:'0.5rem',
                borderRadius:'8px',
                border:'1px solid var(--color-border)',
                background:'var(--color-surface)',
                fontSize:'1rem',
                cursor:'pointer',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                transition:'all 0.2s'
              }}
            >
              ✨
            </button>
            <select
              aria-label="Seleccionar idioma"
              value={lang}
              onChange={e=>onChangeLang?.(e.target.value)}
              style={{
                padding:'0.5rem 0.7rem',
                borderRadius:'12px',
                border:'1px solid var(--color-border)',
                background:'var(--color-surface)',
                fontSize:'0.7rem',
                fontWeight:600,
                letterSpacing:'.5px',
                textTransform:'uppercase'
              }}
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
            </select>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;