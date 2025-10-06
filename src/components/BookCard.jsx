import React, { useState, useMemo } from 'react';
import './BookCard.css';

/**
 * Tarjeta de Libro unificada y responsiva con cuadrícula de metadatos.
 * Props:
 *  - book: objeto libro normalizado
 *  - isFavorite: boolean
 *  - onAddToFavorites(book)
 *  - onRemoveFromFavorites(book)
 *  - className: clases extra opcionales
 */
// Tarjeta minimal: Imagen + Título + Autor + Línea compacta de datos + acción Favorito
function BookCard({ book, isFavorite, onAddToFavorites, onRemoveFromFavorites, className = '' }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const data = useMemo(() => ({
    title: book.title || book.titulo || 'Título no disponible',
    author: book.author || book.autor || (Array.isArray(book.authors) ? book.authors.filter(Boolean).join(', ') : ''),
    year: book.year || book.año || book.publishedDate || '',
    description: book.description || book.descripcion || '',
    thumbnail: book.thumbnail || book.imagen || book.imageLinks?.thumbnail || null,
    isbn: book.isbn || book.ISBN || '',
    pageCount: book.pageCount || book.pages || '',
    genre: book.genre || book.categoria || '',
    source: book.source || 'Desconocido'
  }), [book]);

  const line = useMemo(() => {
    const parts = [];
    if (data.year) parts.push(data.year);
    if (data.genre) parts.push(data.genre);
    if (data.pageCount) parts.push(data.pageCount + ' pág');
    if (data.isbn) parts.push('ISBN ' + data.isbn);
    return parts.slice(0,3).join(' • ');
  }, [data.year, data.genre, data.pageCount, data.isbn]);

  const handleImageError = () => setImageError(true);

  const handleFavoriteClick = () => {
    if (isFavorite) onRemoveFromFavorites?.(book); else onAddToFavorites?.(book);
  };

  const longTitle = data.title.length > 60;
  return (
  <div className={`book-card classic ${isFavorite ? 'favorite-active' : ''} ${className}`.trim()} data-variant="classic">
      {isFavorite && (
        <div className="favorite-ribbon" aria-label="Favorito">Favorito</div>
      )}

      <button
        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        type="button"
      >
        <span className="favorite-icon">{isFavorite ? '❤️' : '🤍'}</span>
      </button>

  <div className={`book-thumb-shell ${imageLoaded ? 'loaded' : 'loading'}`} aria-hidden={!data.thumbnail}>
        {data.thumbnail && !imageError ? (
          <img
            src={data.thumbnail}
            alt={`Portada de ${data.title}`}
            loading="lazy"
            onLoad={()=>setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : (
          <div className="book-image-placeholder" role="img" aria-label="Sin imagen">📚</div>
        )}
      </div>

      <div className="book-content">
        <h3 className={`bc-title ${longTitle ? 'tight' : ''}`} title={data.title}>{data.title}</h3>
        <p className="bc-author" title={data.author || 'Autor desconocido'}>{data.author || 'Autor desconocido'}</p>
        {line && <p className="bc-line" title={line}>{line}</p>}
        <p className="bc-source" title={data.source}>{data.source}</p>
        {data.description && (
          <p className="bc-desc" title={data.description}>{data.description.slice(0,95)}{data.description.length>95 && '…'}</p>
        )}

        <div className="book-actions">
          <button
            type="button"
            className={`btn btn-sm ${isFavorite ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
          >{isFavorite ? 'Quitar' : 'Favorito +'}</button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;