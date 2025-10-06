import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import { createI18n } from './i18n/translations';
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
  const [lang, setLang] = useState(()=> localStorage.getItem('ui_lang') || 'es');
  const t = createI18n(lang);

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

  useEffect(()=>{ localStorage.setItem('ui_lang', lang); }, [lang]);

  // Se elimina el modo oscuro según requerimiento del usuario

  return (
    <Router>
      <div className="app">
  <Header favoritesCount={favoritesCount} lang={lang} onChangeLang={setLang} />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
