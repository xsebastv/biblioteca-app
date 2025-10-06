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
  // Vista única compacta (la variante normal se eliminó)
  const [sortBy, setSortBy] = useState('title');

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
        <div className="fav-actions" style={{display:'flex', gap:'0.6rem', flexWrap:'wrap', justifyContent:'center'}}>
          <div className="filter-group" style={{display:'flex', gap:'.4rem', alignItems:'center'}}>
            <label style={{fontSize:'0.7rem', fontWeight:600}}>{t('sort_by')}</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'0.4rem 0.6rem'}}>
              <option value="title">{t('sort_title')}</option>
              <option value="year">{t('sort_year')}</option>
            </select>
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
            .sort((a,b)=> {
              if (sortBy === 'year') {
                const ay = parseInt(a.year)||0; const by = parseInt(b.year)||0;
                return ay - by;
              }
              const at = (a.title||'').toLocaleLowerCase();
              const bt = (b.title||'').toLocaleLowerCase();
              return at.localeCompare(bt, undefined, { sensitivity:'base' });
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