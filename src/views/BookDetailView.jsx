import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookService from '../services/BookService';
import FavoriteService from '../services/FavoriteService';
import { createI18n } from '../i18n/translations';
import '../components/BookCard.css';
import './BookDetailView.css';

const BookDetailView = ({ lang = localStorage.getItem('ui_lang') || 'es' }) => {
  const t = useMemo(()=>createI18n(lang), [lang]);
  const { id: rawId } = useParams();
  const id = useMemo(()=>{
    try { return decodeURIComponent(rawId); } catch { return rawId; }
  }, [rawId]);
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null);
      try {
        // Buscar primero en favoritos/local list por rapidez
        const local = FavoriteService.getAll().find(b=>b.id === id);
        if (local) {
          if (active) { 
            setBook(local); 
            setIsFavorite(true); 
            setLoading(false); 
          }
          return;
        }
        
        // Intentar obtener desde servicio mejorado
        console.log('🔍 Buscando libro con ID:', id);
        console.log('📋 Libros en favoritos:', FavoriteService.getAll().map(b => ({id: b.id, title: b.title})));
        const remote = await BookService.obtenerLibroPorId(id);
        console.log('📖 Resultado de búsqueda:', remote ? `Encontrado: ${remote.title}` : 'No encontrado');
        
        if (!remote) {
          // Si no se encuentra por ID, intentar extraer información del ID mismo
          console.warn('Libro no encontrado por ID, intentando recuperar información básica...');
          
          let title = t('not_found');
          let source = t('limited_source_placeholder');
          
          // Intentar extraer información del ID
          if (id.startsWith('openlib-')) {
            title = id.replace('openlib-', '').replace(/-/g, ' ');
            source = t('limited_source_openlib');
          } else if (id.startsWith('isbndb-')) {
            title = id.replace('isbndb-', '').replace(/-/g, ' ');
            source = t('limited_source_isbndb');
          } else if (id.startsWith('google-')) {
            title = 'Google Books';
            source = t('limited_source_google');
          }
          
          // Crear un libro placeholder con información básica mejorada
          const placeholderBook = {
            id,
            title,
            author: t('limited_author_placeholder'),
            description: `${t('limited_description_intro',{source})}\n\n${t('limited_description_reasons')}\n\n${t('limited_description_suggestions')}`,
            year: '—',
            thumbnail: '/placeholder-book.png',
            source,
            genre: '—',
            pageCount: null,
            isbn: null,
            language: lang
          };
          
          if (active) {
            setBook(placeholderBook);
            setError(t('limited_error_banner'));
          }
        } else {
          if (active) setBook(remote);
        }
      } catch(e) {
        console.error('Error cargando detalle del libro:', e);
        if (active) setError('No se pudo cargar la información del libro');
      } finally { 
        if (active) setLoading(false); 
      }
    };
    load();
    return ()=>{ active = false; };
  }, [id]);

  useEffect(()=>{
    if (book) setIsFavorite(FavoriteService.existsById(book.id));
  }, [book]);

  // Escuchar cambios globales de favoritos
  useEffect(() => {
    const handler = () => {
      if (book) setIsFavorite(FavoriteService.existsById(book.id));
    };
    window.addEventListener('favorites:changed', handler);
    return () => window.removeEventListener('favorites:changed', handler);
  }, [book]);

  const toggleFavorite = () => {
    if (!book) return;
    if (isFavorite) {
      FavoriteService.remove(book.id);
      setIsFavorite(false);
    } else {
      FavoriteService.add(book);
      setIsFavorite(true);
    }
  };

  if (loading) return <div className="detail-loading"><div className="loading-spinner" /> {t('loading')}</div>;
  if (!book) return <div className="detail-error">{t('not_found')} <button className="btn btn-secondary" onClick={()=>navigate(-1)}>{t('go_back')}</button></div>;
  
  // Mostrar advertencia si hay error pero tenemos información básica
  const hasLimitedInfo = error && book;

  return (
    <div className="book-detail-container">
      <button className="btn btn-link back-btn" onClick={()=>navigate(-1)} aria-label={t('go_back')}>← {t('go_back')}</button>
      
      {/* Advertencia de información limitada */}
      {hasLimitedInfo && (
        <div className="limited-info-warning">
          ⚠️ <strong>{t('limited_info')}:</strong> {t('limited_info_warning')}
        </div>
      )}
      
      <div className="book-detail-card">
        <div className="detail-media">
          {book.thumbnail ? <img src={book.thumbnail} alt={`Portada: ${book.title}`} loading="lazy" /> : <div className="book-image-placeholder">📚</div>}
        </div>
        <div className="detail-body">
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">{book.author}</p>
          <div className="detail-meta-grid">
            {book.year && <div><span className="dm-label">{t('year')}</span><span className="dm-value">{book.year}</span></div>}
            {book.pageCount && <div><span className="dm-label">{t('pages')}</span><span className="dm-value">{book.pageCount}</span></div>}
            {book.genre && <div><span className="dm-label">{t('genre')}</span><span className="dm-value">{book.genre}</span></div>}
            {book.isbn && <div><span className="dm-label">ISBN</span><span className="dm-value">{book.isbn}</span></div>}
            {book.source && <div><span className="dm-label">{t('source')}</span><span className="dm-value">{book.source}</span></div>}
            {book.language && <div><span className="dm-label">{t('language')}</span><span className="dm-value">{book.language}</span></div>}
          </div>
          {book.description && (
            <div className="detail-description">
              <h2>{t('description')}</h2>
              <p className="justified-text">{book.description}</p>
            </div>
          )}
          <div className="detail-actions">
            <button className={`btn ${isFavorite ? 'btn-secondary':''}`} onClick={toggleFavorite} aria-pressed={isFavorite}>
              {isFavorite ? t('favorite_remove') : t('favorite_add')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailView;
