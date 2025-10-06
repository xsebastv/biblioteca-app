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

  const isHome = location.pathname === '/';
  const isFavs = location.pathname === '/favoritos';

  return (
    <header className="header" data-route={location.pathname}>
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
            data-route="home"
            aria-current={isHome ? 'page' : undefined}
            className={`nav-link ${isHome ? 'active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">🏠</span>
            <span className="nav-text">{t('home')}</span>
          </Link>
          <Link
            to="/favoritos"
            data-route="favorites"
            aria-current={isFavs ? 'page' : undefined}
            className={`nav-link ${isFavs ? 'active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">❤️</span>
            <span className="nav-text" style={{position:'relative', display:'inline-flex', alignItems:'center', gap:6}}>
              {t('favorites')}
              {favoritesCount > 0 && (
                <span className="nav-badge nav-badge--count" aria-label={`${favoritesCount} ${t('favorites')}`}>{favoritesCount}</span>
              )}
            </span>
          </Link>
          <div className="header-actions" style={{display:'flex', alignItems:'center', gap:'.6rem', marginLeft:'0.75rem'}}>
            <button
              type="button"
              onClick={resetLanding}
              title="Landing"
              className="header-icon-btn"
              aria-label="Rever landing"
            >✨</button>
            <select
              aria-label={lang === 'es' ? 'Seleccionar idioma' : 'Select language'}
              value={lang}
              onChange={e=>onChangeLang?.(e.target.value)}
              className="lang-select"
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