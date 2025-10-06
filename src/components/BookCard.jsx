import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';
import { createI18n } from '../i18n/translations';
import { useIntersectionFadeIn } from '../hooks/useIntersectionFadeIn';

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
function BookCard({ book, isFavorite, onAddToFavorites, onRemoveFromFavorites, className = '', skeleton = false, lang = 'es' }) {
  const t = useMemo(()=>createI18n(lang), [lang]);
  const { ref: rootRef, visible } = useIntersectionFadeIn();
  const navigate = useNavigate();
  if (skeleton) {
    return (
      <div ref={rootRef} className={`book-card skeleton layout-rich ${className}`.trim()} aria-hidden="true" role="presentation">
        <div className="bc-rich-media" />
        <div className="bc-rich-body">
          <div className="sk-line sk-title" />
          <div className="sk-line sk-sub" />
          <div className="sk-line sk-meta" />
          <div className="sk-line sk-desc" />
        </div>
      </div>
    );
  }
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImg, setShowFullImg] = useState(false); // para lazy blur
  // Descripción completa removida de la tarjeta (ahora en vista detalle)

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

  const metaItems = useMemo(() => {
    const arr = [];
    if (data.year) arr.push({ key:'year', label:data.year, icon:'📅', title:'Año de publicación' });
    if (data.pageCount) arr.push({ key:'pages', label:data.pageCount + ' págs', icon:'📖', title:'Número de páginas' });
    if (data.genre) arr.push({ key:'genre', label:data.genre, icon:'🏷️', title:'Género / categoría' });
    if (data.isbn) arr.push({ key:'isbn', label:data.isbn, icon:'🔢', title:'ISBN' });
    return arr.slice(0,4);
  }, [data.year, data.pageCount, data.genre, data.isbn]);

  const handleImageError = () => setImageError(true);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Evitar que se active la navegación al hacer click en favoritos
    if (isFavorite) onRemoveFromFavorites?.(book); else onAddToFavorites?.(book);
  };

  const handleCardClick = () => {
    navigate(`/libro/${book.id}`);
  };

  const longTitle = false; // ahora siempre mostramos el título completo en tarjeta
  return (
  <article 
    ref={rootRef} 
    className={`book-card layout-rich ${visible ? 'in-view' : 'pre-view'} ${isFavorite ? 'favorite-active' : ''} ${className}`.trim()} 
    data-variant="bright" 
    aria-label={data.title}
    onClick={handleCardClick}
    style={{ cursor: 'pointer' }}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    }}
  >
      {isFavorite && (
        <div className="favorite-ribbon" aria-label={t('favorite_label')}>{t('favorite_label')}</div>
      )}

      <div className="bc-rich-media">
        <div className={`book-thumb-shell ${imageLoaded ? 'loaded' : 'loading'}`} aria-hidden={!data.thumbnail}>
          {data.thumbnail && !imageError ? (
            <>
              {!showFullImg && (
                <div className="img-blur-placeholder" aria-hidden="true" />
              )}
              <img
                src={data.thumbnail}
                alt={`Portada: ${data.title}`}
                loading="lazy"
                onLoad={() => { setImageLoaded(true); setTimeout(()=>setShowFullImg(true),120); }}
                onError={handleImageError}
                className={showFullImg ? 'img-visible' : 'img-hidden'}
              />
            </>
          ) : (
            <div className="book-image-placeholder" role="img" aria-label="Sin imagen">📚</div>
          )}
        </div>
        
        {/* Botón de favorito posicionado sobre la imagen */}
        <button
          type="button"
          className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
          onClick={handleFavoriteClick}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t('favorite_unmark') : t('favorite_mark')}
          title={isFavorite ? t('favorite_remove') : t('favorite_add')}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="bc-rich-body">
        <header className="bc-rich-header">
          <h3 className={`bc-title ${longTitle ? 'tight' : ''}`} title={data.title}>{data.title}</h3>
          <p className="bc-author" title={data.author || t('unknown_author')}>{data.author || t('unknown_author')}</p>
        </header>
        {metaItems.length > 0 && (
          <ul className="bc-meta-row" role="list" aria-label="Metadatos">
            {metaItems.map(mi => (
              <li key={mi.key} className="bc-meta-item" title={`${mi.title}: ${mi.label}`}>
                <span className="mi-icon" aria-hidden="true">{mi.icon}</span>
                <span className="mi-text">{mi.label}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="bc-source" title={data.source}>{data.source}</p>
        {!!data.description && (
          <p className="bc-desc-short" title={data.description.length > 160 ? data.description.slice(0,220)+'…' : data.description}>
            {data.description.slice(0,120)}{data.description.length>120 && '…'}
          </p>
        )}

      </div>
  </article>
  );
}

export default BookCard;