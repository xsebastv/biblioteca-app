import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

/**
 * Componente Navigation - Navegación principal de la biblioteca
 * Solo incluye las páginas requeridas por el proyecto
 */
const Navigation = () => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            end
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Inicio</span>
          </NavLink>
          <NavLink 
            to="/favoritos" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">💖</span>
            <span className="nav-text">Favoritos</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;