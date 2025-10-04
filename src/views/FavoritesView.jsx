import React, { useEffect, useState } from 'react';
import FavoriteService from '../services/FavoriteService';
import './FavoritesView.css';

const FavoritesView = () => {
  const [favorites, setFavorites] = useState([]);
  const [undoData, setUndoData] = useState(null); // { book, timeoutId }
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(FavoriteService.getAll());
  };

  const handleRemoveFromFavorites = (book) => {
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

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>💖 Mis Libros Favoritos</h1>
        <p>Gestiona tu colección personal de libros favoritos</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <h3>No tienes libros favoritos aún</h3>
          <p>Agrega libros a tus favoritos desde la página principal</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(book => (
            <div key={book.id} className="favorite-card">
              <div className="book-info">
                <h3 className="book-title">{book.title || 'Título no disponible'}</h3>
                <p className="book-author"><strong>Autor:</strong> {book.author || 'Autor desconocido'}</p>
                <p className="book-year"><strong>Año:</strong> {book.year || 'Año no disponible'}</p>
              </div>
              <div className="book-actions">
                <button 
                  className="btn btn-remove"
                  onClick={() => handleRemoveFromFavorites(book)}
                >
                  💔 Eliminar de Favoritos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUndo && undoData?.book && (
        <div style={{position:'fixed', left:'50%', bottom:'30px', transform:'translateX(-50%)', background:'#323232', color:'#fff', padding:'14px 22px', borderRadius:'8px', display:'flex', gap:'18px', alignItems:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.3)', zIndex:1000}} role="status" aria-live="polite">
          <span>Eliminado: {undoData.book.title}</span>
          <button onClick={handleUndo} style={{background:'transparent', border:'1px solid #888', color:'#fff', padding:'6px 14px', borderRadius:'6px', cursor:'pointer'}}>
            Deshacer
          </button>
          <button onClick={()=>{setShowUndo(false); if(undoData?.timeoutId) clearTimeout(undoData.timeoutId);}} aria-label="Cerrar" style={{background:'transparent', border:'none', color:'#bbb', fontSize:'18px', cursor:'pointer'}}>×</button>
        </div>
      )}
    </div>
  );
};

export default FavoritesView;