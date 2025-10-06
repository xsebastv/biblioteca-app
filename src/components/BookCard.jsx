import React, { useState } from 'react';
import './BookCard.css';

function BookCard({ book, onAddToFavorites, onRemoveFromFavorites, isFavorite }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const bookData = {
    titulo: book.title || book.titulo || 'Título no disponible',
    autor: book.author || book.autor || (Array.isArray(book.authors) ? book.authors.join(', ') : 'Autor no disponible'),
    año: book.year || book.año || book.publishedDate || 'Año no disponible',
    descripcion: book.description || book.descripcion || 'Sin descripción disponible',
    imagen: book.thumbnail || book.imagen || book.imageLinks?.thumbnail || null,
  };

  const handleFavoriteAction = () => {
    if (isFavorite) {
      onRemoveFromFavorites(book.id);
    } else {
      onAddToFavorites(book);
    }
  };

  return (
    <div className="book-card">
      {isFavorite && <div className="favorite-ribbon" aria-label="Marcado como favorito">Favorito</div>}
      <button 
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleFavoriteAction}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <span className="favorite-icon">
          {isFavorite ? '❤️' : '🤍'}
        </span>
      </button>

      <div className="book-thumbnail">
        {bookData.imagen && !imageError ? (
          <img 
            src={bookData.imagen} 
            alt={`Portada de ${bookData.titulo}`}
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="book-image-placeholder">
            📚
          </div>
        )}
      </div>

      <div className="book-content">
        <h3 className="book-title">
          {bookData.titulo}
        </h3>
        
        <div className="book-author">
          {bookData.autor}
        </div>
        
        <div className="book-year">
          {bookData.año}
        </div>
        
        {bookData.descripcion && bookData.descripcion !== 'Sin descripción disponible' && (
          <div className="book-description">
            {bookData.descripcion}
          </div>
        )}

        <div className="book-actions">
          <button className="btn btn-primary">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;