import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookService from '../services/BookService';
import FavoriteService from '../services/FavoriteService';
import { createI18n } from '../i18n/translations';
import '../components/BookCard.css';
import './BookDetailView.css';

const BookDetailView = ({ lang = localStorage.getItem('ui_lang') || 'es' }) => {
  const t = useMemo(()=>createI18n(lang), [lang]);
  const { id } = useParams();
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
          if (active) { setBook(local); setIsFavorite(true); setLoading(false); }
          return;
        }
        // Intentar obtener desde servicio (Google etc.)
        const remote = await BookService.obtenerLibroPorId(id);
        if (!remote) throw new Error('No encontrado');
        if (active) setBook(remote);
      } catch(e) {
        console.error('Detalle error', e);
        if (active) setError('No se pudo cargar el libro');
      } finally { if (active) setLoading(false); }
    };
    load();
    return ()=>{ active = false; };
  }, [id]);

  useEffect(()=>{
    if (book) setIsFavorite(FavoriteService.existsById(book.id));
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

  if (loading) return <div className="detail-loading"><div className="loading-spinner" /> Cargando...</div>;
  if (error) return <div className="detail-error">{error} <button className="btn btn-secondary" onClick={()=>navigate(-1)}>Volver</button></div>;
  if (!book) return <div className="detail-error">No encontrado <button className="btn btn-secondary" onClick={()=>navigate(-1)}>Volver</button></div>;

  return (
    <div className="book-detail-container">
      <button className="btn btn-link back-btn" onClick={()=>navigate(-1)} aria-label="Regresar">← Volver</button>
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
            {book.genre && <div><span className="dm-label">Género</span><span className="dm-value">{book.genre}</span></div>}
            {book.isbn && <div><span className="dm-label">ISBN</span><span className="dm-value">{book.isbn}</span></div>}
            {book.source && <div><span className="dm-label">{t('source')}</span><span className="dm-value">{book.source}</span></div>}
            {book.language && <div><span className="dm-label">Idioma</span><span className="dm-value">{book.language}</span></div>}
          </div>
          {book.description && (
            <div className="detail-description">
              <h2>Descripción</h2>
              <p>{book.description}</p>
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
