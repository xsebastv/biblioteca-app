import React, { useEffect, useState, useMemo } from 'react';
import FavoriteService from '../services/FavoriteService';
import './FavoritesView.css';
import Modal from '../components/Modal';
import BookCard from '../components/BookCard';
import { createI18n } from '../i18n/translations';

/**
 * Vista de Favoritos
 * - Lista los libros guardados en localStorage
 * - Permite deshacer la última eliminación (toast temporal)
 * - Ordena por título o año (robusto ante datos faltantes)
 */
const FavoritesView = ({ lang = localStorage.getItem('ui_lang') || 'es' }) => {
  const t = useMemo(() => createI18n(lang), [lang]);
  const [favorites, setFavorites] = useState([]);
  const [undoData, setUndoData] = useState(null); // { book, timeoutId }
  const [showUndo, setShowUndo] = useState(false);
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('favs_sortBy') || 'added'); // 'title' | 'added'
  const [sortDirection, setSortDirection] = useState(() => localStorage.getItem('favs_sortDirection') || 'desc'); // 'asc' | 'desc'
  
  // Persistir preferencias de ordenación
  useEffect(() => {
    localStorage.setItem('favs_sortBy', sortBy);
    localStorage.setItem('favs_sortDirection', sortDirection);
  }, [sortBy, sortDirection]);

  useEffect(() => {
    loadFavorites();
  }, []);

  // Escuchar cambios globales de favoritos
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.favorites) {
        setFavorites(e.detail.favorites);
      } else {
        loadFavorites();
      }
    };
    window.addEventListener('favorites:changed', handler);
    return () => window.removeEventListener('favorites:changed', handler);
  }, []);

  const loadFavorites = () => setFavorites(FavoriteService.getAll());

  const addToFavorites = (book) => {
    const updated = FavoriteService.add(book);
    setFavorites(updated);
  };

  const removeFromFavorites = (book) => {
    if (!book) return;
    const updated = FavoriteService.remove(book.id);
    setFavorites(updated);
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => { setShowUndo(false); setUndoData(null); }, 5000);
    setUndoData({ book, timeoutId });
    setShowUndo(true);
  };

  const handleUndo = () => {
    if (undoData?.book) {
      const updated = FavoriteService.add(undoData.book);
      setFavorites(updated);
    }
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    setUndoData(null);
    setShowUndo(false);
  };

    // Aplica clase dark al contenedor si corresponde
    return (
      <div className="favorites-container"> 
      <div className="favorites-header">
  <h1 className="fav-title">💖 {t('favorites')}</h1>
  <p className="fav-sub">{t('favorites_sub')}</p>
        <div className="fav-actions" style={{display:'flex', gap:'0.6rem', flexWrap:'wrap', justifyContent:'center', marginBottom: '1rem'}}>
          <div className="filter-group" style={{display:'flex', gap:'.4rem', alignItems:'center', background: '#f5f5f5', padding: '0.5rem', borderRadius: '6px'}}>
            <label style={{fontSize:'0.9rem', fontWeight:600, color: '#333'}}>{t('sort_by')}</label>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <option value="added">{t('sort_added')}</option>
              <option value="title">{t('sort_title')}</option>
            </select>
            <button 
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '0.4rem 0.8rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '40px',
                transition: 'all 0.2s ease'
              }}
              title={t(sortDirection === 'asc' ? 'sort_desc' : 'sort_asc')}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <h3>{t('no_favorites')}</h3>
          <p>{t('no_favorites_desc')}</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites
            .slice()
            .sort((a, b) => {
              let comparison = 0;
              
              if (sortBy === 'added') {
                // Ordenar por fecha de agregado
                const at = a.addedAt || 0;
                const bt = b.addedAt || 0;
                comparison = at - bt;
              } else if (sortBy === 'title') {
                // Ordenar por título
                const at = (a.title || '').toLowerCase();
                const bt = (b.title || '').toLowerCase();
                comparison = at.localeCompare(bt, undefined, { sensitivity: 'base' });
              }
              
              // Invertir el orden si es descendente
              return sortDirection === 'desc' ? -comparison : comparison;
            })
            .map(book => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={true}
                onRemoveFromFavorites={removeFromFavorites}
                onAddToFavorites={addToFavorites}
                className="fade-in"
                lang={lang}
              />
            ))}
        </div>
      )}

      {showUndo && undoData?.book && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span className="undo-text">{t('remove')}: {undoData.book.title}</span>
          <button onClick={handleUndo} className="undo-btn">{t('undo')}</button>
          <button onClick={()=>{setShowUndo(false); if(undoData?.timeoutId) clearTimeout(undoData.timeoutId);}} aria-label={t('close')} className="undo-close" title={t('close')}>×</button>
        </div>
      )}

      {/* Modal Agregar eliminado */}

    </div>
  );
};

export default FavoritesView;