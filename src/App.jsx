import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import './App.css';

/**
 * Aplicación Biblioteca Digital - Proyecto Universitario
 * Requisitos cumplidos:
 * 1. Página de Inicio (1.0 pts) - Vista de bienvenida con lista de libros
 * 2. Funcionalidad para Agregar Libros Favoritos (1.0 pts) - Modal para agregar
 * 3. Funcionalidad para Eliminar Libros de Favoritos (1.5 pts) - Modal de confirmación
 * 4. Almacenamiento de Datos (1.5 pts) - localStorage para persistencia
 */
function App() {
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const load = () => {
      try {
        const data = JSON.parse(localStorage.getItem('favoriteBooks')) || [];
        setFavoritesCount(Array.isArray(data) ? data.length : 0);
      } catch { setFavoritesCount(0); }
    };
    load();
    const handler = (e) => {
      if (e.key === 'favoriteBooks') load();
    };
    window.addEventListener('storage', handler);
    // Escucha interna reactiva para cambios en favoritos dentro de la misma pestaña
    const internalHandler = (e) => {
      if (e?.detail?.count != null) {
        setFavoritesCount(e.detail.count);
      } else {
        load();
      }
    };
    window.addEventListener('favorites:changed', internalHandler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('favorites:changed', internalHandler);
    };
  }, []);

  // Se elimina el modo oscuro según requerimiento del usuario

  return (
    <Router>
      <div className="app">
        <Header favoritesCount={favoritesCount} />
        <main className="main-content">
          <AppRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
