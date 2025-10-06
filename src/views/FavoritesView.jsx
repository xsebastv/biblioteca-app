import React, { useEffect, useState, useMemo } from 'react';
import FavoriteService from '../services/FavoriteService';
import './FavoritesView.css';
import Modal from '../components/Modal';
import BookCard from '../components/BookCard';
import ConfirmModal from '../components/ConfirmModal';
import { createI18n } from '../i18n/translations';

const FavoritesView = ({ lang = localStorage.getItem('ui_lang') || 'es' }) => {
  const t = useMemo(() => createI18n(lang), [lang]);
  const [favorites, setFavorites] = useState([]);
  const [undoData, setUndoData] = useState(null); // { book, timeoutId }
  const [showUndo, setShowUndo] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  // Vista única compacta (la variante normal se eliminó)
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(FavoriteService.getAll());
  };

  const openRemoveConfirm = (book) => { setBookToRemove(book); setShowConfirmModal(true); };
  const confirmRemove = () => {
    if (!bookToRemove) return;
    const book = bookToRemove;
    const updated = FavoriteService.remove(book.id);
    setFavorites(updated);
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => { setShowUndo(false); setUndoData(null); }, 5000);
    setUndoData({ book, timeoutId });
    setShowUndo(true);
    setBookToRemove(null);
    setShowConfirmModal(false);
  };
  const cancelRemove = () => { setBookToRemove(null); setShowConfirmModal(false); };

  // Eliminado agregar manual

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
        <h1 className="fav-title">💖 Mis Libros Favoritos</h1>
        <p className="fav-sub">Gestiona tu colección personal de libros favoritos</p>
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
            .sort((a,b)=> sortBy === 'year' ? (''+(a.year||'')).localeCompare((''+(b.year||''))) : (a.title||'').localeCompare(b.title||''))
            .map(book => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={true}
                onRemoveFromFavorites={openRemoveConfirm}
                onAddToFavorites={()=>{}}
                className="fade-in"
                lang={lang}
              />
            ))}
        </div>
      )}

      {showUndo && undoData?.book && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span className="undo-text">Eliminado: {undoData.book.title}</span>
          <button onClick={handleUndo} className="undo-btn">Deshacer</button>
          <button onClick={()=>{setShowUndo(false); if(undoData?.timeoutId) clearTimeout(undoData.timeoutId);}} aria-label="Cerrar" className="undo-close">×</button>
        </div>
      )}

      {/* Modal Agregar eliminado */}

      {/* Modal Confirmación */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={cancelRemove}
          onConfirm={confirmRemove}
          onCancel={cancelRemove}
          title={t('confirm_remove')}
          message={t('remove_favorite_message', { title: bookToRemove?.title })}
          confirmText={t('remove')}
          cancelText={t('cancel')}
          type="danger"
        />
      )}
    </div>
  );
};

export default FavoritesView;