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
            to="/favorites" 
            className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}
          >
            <span className="nav-icon">❤️</span>
            <span>Favoritos ({favoritesCount})</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;