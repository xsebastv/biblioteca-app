import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeView from '../views/HomeView';
import FavoritesView from '../views/FavoritesView';
import BookDetailView from '../views/BookDetailView';

/**
 * Configuración de rutas de la aplicación biblioteca digital
 * Rutas principales según los requerimientos del proyecto universitario:
 * 
 * 1. Página de Inicio (1.0 pts) - Lista principal de libros con funcionalidad de agregar favoritos
 * 2. Página de Favoritos (1.5 pts) - Para gestionar y eliminar libros favoritos con confirmación
 */
const AppRoutes = ({ lang }) => {
  return (
    <Routes>
      {/* Página de Inicio - Cumple con Requerimiento "Página de Inicio (1.0)" */}
      <Route path="/" element={<HomeView lang={lang} />} />
      
      {/* Página de Favoritos - Cumple con "Agregar Favoritos (1.0)" y "Eliminar Favoritos (1.5)" */}
      <Route path="/favoritos" element={<FavoritesView lang={lang} />} />
      {/* Vista de detalle de libro */}
      <Route path="/libro/:id" element={<BookDetailView lang={lang} />} />
    </Routes>
  );
};

export default AppRoutes;