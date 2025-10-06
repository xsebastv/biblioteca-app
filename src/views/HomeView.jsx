import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import BookController from '../controllers/BookController';
import FavoriteService from '../services/FavoriteService';
import './HomeView.css';

const PAGE_SIZE = 45; // aumentar resultados por página para mostrar más libros

const HomeView = () => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  // Modal eliminado: eliminación directa
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastQuery, setLastQuery] = useState('');
  const [undoData, setUndoData] = useState(null); // { book, timeoutId }
  const [showUndo, setShowUndo] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);

  const sentinelRef = useRef(null);

  useEffect(() => { loadInitial(); loadFavorites(); }, []);


  const loadInitial = async () => {
    try {
      setInitialLoading(true);
      const data = await BookController.getAllBooks();
      setBooks(data);
      setPage(1);
      setHasMore(true);
    } catch (e) {
      console.error('Error inicial:', e);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const loadFavorites = () => setFavorites(FavoriteService.getAll());

  // Escuchar cambios globales (por si se modifica en otra vista y no pasa por estos handlers)
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

  const isFavorite = id => favorites.some(f => f.id === id);

  // Agrupar libros por fuente cuando toggle activo
  const groupedBooks = useMemo(() => {
    if (!groupBySource) return null;
    const groups = books.reduce((acc,b)=>{ (acc[b.source] = acc[b.source] || []).push(b); return acc; }, {});
    return Object.entries(groups).sort((a,b)=> a[0].localeCompare(b[0]));
  }, [books, groupBySource]);

  const [addingIds, setAddingIds] = useState(new Set());
  const addToFavorites = book => {
    console.log('[UI] Click Favorito', book);
    if (!book) { alert('Error: libro no definido'); return; }
    if (!book.id) { alert('Error: libro sin id'); console.warn('[UI] libro sin id', book); return; }
    if (addingIds.has(book.id)) return;
    setAddingIds(prev => new Set(prev).add(book.id));
    const updated = FavoriteService.add(book);
    setFavorites(updated);
    setTimeout(() => setAddingIds(prev => { const n = new Set(prev); n.delete(book.id); return n; }), 400);
  };

  const handleRemoveFromFavorites = book => { 
    const updated = FavoriteService.remove(book.id);
    setFavorites(updated);
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => { setShowUndo(false); setUndoData(null); }, 5000);
    setUndoData({ book, timeoutId });
    setShowUndo(true);
  };

  // confirmRemoveFromFavorites / cancelRemove removidos (ya no hay modal)

  const handleSearchSubmit = async e => {
    e.preventDefault();
    const term = search.trim();
    if (!term) { setLastQuery(''); await loadInitial(); return; }
    try {
      setSearching(true); setLoading(true); setLastQuery(term);
      const service = await import('../services/BookService.js').then(m => m.default);
      const result = await service.obtenerPaginaLibros(term, 1, PAGE_SIZE);
      setBooks(result); setPage(1); setHasMore(result.length === PAGE_SIZE);
    } catch (e2) { console.error('Busqueda error:', e2); }
    finally { setLoading(false); setSearching(false); }
  };

  const handleClearSearch = async () => { setSearch(''); setLastQuery(''); await loadInitial(); };

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loading) return;
    try {
      setLoading(true);
      const service = await import('../services/BookService.js').then(m => m.default);
      const term = lastQuery || 'programming';
      const next = await service.obtenerPaginaLibros(term, page + 1, PAGE_SIZE);
      if (next.length === 0) setHasMore(false); else {
        setBooks(prev => [...prev, ...next]);
        setPage(p => p + 1);
        if (next.length < PAGE_SIZE) setHasMore(false);
      }
    } catch (e) { console.error('Siguiente página error:', e); setHasMore(false); }
    finally { setLoading(false); }
  }, [hasMore, loading, lastQuery, page]);

  useEffect(() => {
    const el = sentinelRef.current; if (!el) return;
    const obs = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) loadNextPage(); }), { rootMargin: '140px' });
    obs.observe(el); return () => obs.disconnect();
  }, [loadNextPage]);

  const handleUndo = () => { if (undoData?.book) addToFavorites(undoData.book); if (undoData?.timeoutId) clearTimeout(undoData.timeoutId); setUndoData(null); setShowUndo(false); };

  if (initialLoading) return (<div className="loading"><div className="loading-spinner"></div><p>Cargando libros...</p></div>);

  return (
    <div className="home-container">
      <section className="search-section home-search-stack">
        <div className="home-search-header">
          <h2 className="home-search-title">Explora la Biblioteca Multifuente</h2>
          <div className="home-search-actions">
            <button type="button" onClick={()=>setGroupBySource(g=>!g)} className="btn btn-secondary btn-sm">{groupBySource ? '🔀 Mezclar' : '🗂️ Agrupar'}</button>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="search-form" role="search" aria-label="Buscar libros">
          <input type="text" placeholder="Buscar por título, autor o tema..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Término de búsqueda" />
          <button type="submit" disabled={searching}>{searching ? 'Buscando...' : 'Buscar'}</button>
          {lastQuery && <button type="button" onClick={handleClearSearch}>Limpiar</button>}
        </form>
        <div className="home-search-meta">
          {lastQuery && <p className="home-search-result-label">Resultados para: <strong>{lastQuery}</strong></p>}
          <span className="home-search-count">Mostrando {books.length} libros</span>
        </div>
      </section>

      <div className="books-section">
  <h3 className="home-section-title">{lastQuery ? 'Resultados' : 'Libros Populares'} {groupBySource && <small className="home-group-badge">Agrupado por fuente</small>}</h3>
        {!groupBySource && (
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className={`book-card fade-in ${isFavorite(book.id) ? 'favorite-active' : ''}`}> 
                {isFavorite(book.id) && <div className="favorite-ribbon" aria-label="Libro en favoritos">Favorito</div>}
                <div className="book-thumb-wrapper">
                  <img src={book.thumbnail || '/placeholder-book.png'} alt={book.title} className="book-thumb" loading="lazy" />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title || 'Título no disponible'}</h3>
                  <p className="book-author"><strong>Autor:</strong> {book.author || 'Autor desconocido'}</p>
                  <p className="book-year"><strong>Año:</strong> {book.year || 'Año no disponible'}</p>
                  {book.genre && <p className="book-year"><strong>Género:</strong> {book.genre}</p>}
                  {book.pageCount && <p className="book-year"><strong>Páginas:</strong> {book.pageCount}</p>}
                  {book.isbn && <p className="book-year"><strong>ISBN:</strong> {book.isbn}</p>}
                  <div className={`book-source-badge source-${book.source.toLowerCase().replace(/\s+/g,'-')}`}>
                    <span className="source-icon">{book.source === 'Google Books' ? '🔍' : book.source === 'Open Library' ? '📚' : book.source === 'ISBNdb' ? '🏷️' : '📖'}</span>
                    {book.source}
                  </div>
                </div>
                {/* Botón favorito pequeño flotante */}
                <button
                  className={`favorite-float-btn ${isFavorite(book.id) ? 'active' : ''}`}
                  onClick={() => isFavorite(book.id) ? handleRemoveFromFavorites(book) : addToFavorites(book)}
                  disabled={addingIds.has(book.id)}
                  title={isFavorite(book.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  style={{position:'absolute', top:'8px', right:'8px', zIndex:2}}
                >
                  <span className="favorite-icon">{isFavorite(book.id) ? '💖' : '🤍'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
        {groupBySource && (
          <div className="home-group-wrapper">
            {groupedBooks.map(([source, list]) => (
              <section key={source} className="home-source-section">
                <h4 className="home-source-header">
                  <span className={`book-source-badge source-${source.toLowerCase().replace(/\s+/g,'-')}`}>
                    <span className="source-icon">{source === 'Google Books' ? '🔍' : source === 'Open Library' ? '📚' : source === 'ISBNdb' ? '🏷️' : '📖'}</span>
                    {source}
                  </span>
                  <small className="home-source-count">{list.length} libros</small>
                </h4>
                <div className="books-grid">
                  {list.map(book => (
                      <div key={book.id} className={`book-card fade-in ${isFavorite(book.id) ? 'favorite-active' : ''}`}> 
                        {isFavorite(book.id) && <div className="favorite-ribbon" aria-label="Libro en favoritos">Favorito</div>}
                      <div className="book-thumb-wrapper">
                        <img src={book.thumbnail || '/placeholder-book.png'} alt={book.title} className="book-thumb" loading="lazy" />
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author"><strong>Autor:</strong> {book.author}</p>
                        <p className="book-year"><strong>Año:</strong> {book.year}</p>
                        {book.genre && <p className="book-year"><strong>Género:</strong> {book.genre}</p>}
                        {book.pageCount && <p className="book-year"><strong>Páginas:</strong> {book.pageCount}</p>}
                        {book.isbn && <p className="book-year"><strong>ISBN:</strong> {book.isbn}</p>}
                      </div>
                      {/* Botón favorito pequeño flotante */}
                      <button
                        className={`favorite-float-btn ${isFavorite(book.id) ? 'active' : ''}`}
                        onClick={() => isFavorite(book.id) ? handleRemoveFromFavorites(book) : addToFavorites(book)}
                        disabled={addingIds.has(book.id)}
                        title={isFavorite(book.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <span className="favorite-icon">{isFavorite(book.id) ? '💖' : '🤍'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <div ref={sentinelRef} style={{height:'1px'}} />
        {loading && !initialLoading && <p className="list-status">Cargando más...</p>}
        {!hasMore && !loading && <p className="list-status list-status-end">No hay más resultados.</p>}
      </div>
    </div>
  );
};

export default HomeView;