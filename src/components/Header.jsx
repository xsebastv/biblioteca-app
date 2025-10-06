import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ favoritesCount = 0 }) => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            📚
          </div>
          <span>Biblioteca Digital</span>
        </Link>

        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span>Inicio</span>
          </Link>
          <Link 
            to="/favoritos" 
            className={`nav-link ${location.pathname === '/favoritos' ? 'active' : ''}`}
          >
            <span className="nav-icon">❤️</span>
            <span style={{position:'relative', display:'inline-flex', alignItems:'center', gap:4}}>
              Favoritos
              {favoritesCount > 0 && (
                <span style={{background:'var(--color-primary)', color:'#fff', fontSize:'10px', padding:'2px 6px', borderRadius:12, lineHeight:1, fontWeight:600}}>{favoritesCount}</span>
              )}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;