import React, { useState } from 'react';
import './BookCard.css';

function BookCard({ book, onAddToFavorites, onRemoveFromFavorites, isFavorite }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Procesar datos del libro con fallbacks robustos
  const bookData = {
    titulo: book.title || book.titulo || book.name || 'Título no disponible',
    autor: book.author || book.autor || book.authors || (Array.isArray(book.authors) ? book.authors.join(', ') : 'No disponible'),
    año: book.year || book.año || book.publishedDate || book.publicationYear || 'No disponible',
    genero: book.genre || book.genero || (Array.isArray(book.categories) ? book.categories.join(', ') : book.categories) || (Array.isArray(book.subject) ? book.subject.join(', ') : book.subject) || 'Género no disponible',
    paginas: book.pageCount || book.paginas || book.pages || book.num_pages || 'No especificado',
    descripcion: book.description || book.descripcion || book.subtitle || book.resumen || book.summary || 'Sin descripción disponible',
    imagen: book.thumbnail || book.imagen || book.imageLinks?.thumbnail || book.cover || book.coverImage || null,
    rating: book.rating || book.averageRating || book.valoracion || null,
    fuente: book.source || book.fuente || book.api || 'API',
    isbn: book.isbn || book.ISBN || (Array.isArray(book.isbn) ? book.isbn[0] : null) || null
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
      <div className="book-image-container">
        {bookData.imagen && !imageError ? (
          <img 
            src={bookData.imagen} 
            alt={`Portada de ${bookData.titulo}`}
            className="book-image"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="book-image-placeholder">
            <div>📚</div>
            <div style={{fontSize: '14px', marginTop: '10px', textAlign: 'center', padding: '0 10px'}}>
              {bookData.titulo.substring(0, 30)}...
            </div>
          </div>
        )}
        {bookData.fuente && (
          <div className="api-badge">{bookData.fuente}</div>
        )}
        {bookData.rating && (
          <div className="rating-badge">
            <span>⭐</span>
            <span>{bookData.rating}</span>
          </div>
        )}
      </div>
      <div className="book-content">
        <h3 className="book-title" title={bookData.titulo || 'Título no disponible'}>
          {bookData.titulo && bookData.titulo !== 'Título no disponible' ? bookData.titulo : 'Título no disponible'}
        </h3>
        <div className="book-info">
          <div className="book-info-item">
            <span role="img" aria-label="Autor" style={{marginRight: '6px'}}>🧑‍💼</span>
            <span className="info-label">Autor:</span>
            <span className="info-value">{bookData.autor}</span>
          </div>
          <div className="book-info-item">
            <span role="img" aria-label="Año" style={{marginRight: '6px'}}>📅</span>
            <span className="info-label">Año:</span>
            <span className="info-value">{bookData.año}</span>
          </div>
          {bookData.genero && bookData.genero !== 'Género no disponible' && (
            <div className="book-info-item">
              <span role="img" aria-label="Género" style={{marginRight: '6px'}}>🏷️</span>
              <span className="info-label">Género:</span>
              <span className="info-value">{bookData.genero}</span>
            </div>
          )}
          {bookData.paginas && bookData.paginas !== 'No especificado' && (
            <div className="book-info-item">
              <span role="img" aria-label="Páginas" style={{marginRight: '6px'}}>📄</span>
              <span className="info-label">Páginas:</span>
              <span className="info-value">{bookData.paginas}</span>
            </div>
          )}
          {bookData.isbn && (
            <div className="book-info-item">
              <span role="img" aria-label="ISBN" style={{marginRight: '6px'}}>📚</span>
              <span className="info-label">ISBN:</span>
              <span className="info-value">{bookData.isbn}</span>
            </div>
          )}
          {bookData.rating && (
            <div className="book-info-item">
              <span role="img" aria-label="Valoración" style={{marginRight: '6px'}}>⭐</span>
              <span className="info-label">Valoración:</span>
              <span className="info-value">{bookData.rating}</span>
            </div>
          )}
          {bookData.fuente && (
            <div className="book-info-item">
              <span role="img" aria-label="Fuente" style={{marginRight: '6px'}}>🔗</span>
              <span className="info-label">Fuente/API:</span>
              <span className="info-value">{bookData.fuente}</span>
            </div>
          )}
        </div>
        <div className="book-description" title={bookData.descripcion || 'Sin descripción disponible'}>
          {bookData.descripcion && bookData.descripcion !== 'Sin descripción disponible' ? bookData.descripcion : 'Sin descripción disponible'}
        </div>
        <div className="book-actions">
          <button
            className={`favorite-button ${isFavorite ? 'remove' : 'add'}`}
            onClick={handleFavoriteAction}
            aria-label={isFavorite ? `Eliminar ${bookData.titulo} de favoritos` : `Agregar ${bookData.titulo} a favoritos`}
          >
            <span style={{fontSize: '18px'}}>
              {isFavorite ? '💔' : '💖'}
            </span>
            <span>
              {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;

