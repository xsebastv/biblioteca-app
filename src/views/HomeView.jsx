import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Modal from '../components/Modal';
import BookController from '../controllers/BookController';
import FavoriteService from '../services/FavoriteService';
import './HomeView.css';
import BookCard from '../components/BookCard';

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
  const [confirmRemoveModal, setConfirmRemoveModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);
  // Vista única (compacta) — se eliminó la vista completa
  const [sortBy, setSortBy] = useState('title'); // 'title' | 'year'
  const [filterSource, setFilterSource] = useState('');
  // Formulario manual (también disponible aquí para cumplir claramente el requisito)
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({ title:'', author:'', year:'', isbn:'', thumbnail:'' });
  const [manualErrors, setManualErrors] = useState({});

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
  const visibleBooks = useMemo(() => {
    let list = [...books];
    if (filterSource) list = list.filter(b => b.source === filterSource);
    list.sort((a,b)=>{
      if (sortBy === 'year') return (''+ (a.year||'')).localeCompare((''+(b.year||'')));
      return (a.title||'').localeCompare(b.title||'');
    });
    return list;
  }, [books, sortBy, filterSource]);

  const groupedBooks = useMemo(() => {
    if (!groupBySource) return null;
    const groups = visibleBooks.reduce((acc,b)=>{ (acc[b.source] = acc[b.source] || []).push(b); return acc; }, {});
    return Object.entries(groups).sort((a,b)=> a[0].localeCompare(b[0]));
  }, [visibleBooks, groupBySource]);

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

  const requestRemoveFavorite = (book) => {
    setBookToRemove(book);
    setConfirmRemoveModal(true);
  };

  const confirmRemoveFavorite = () => {
    if (!bookToRemove) return;
    const book = bookToRemove;
    const updated = FavoriteService.remove(book.id);
    setFavorites(updated);
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => { setShowUndo(false); setUndoData(null); }, 5000);
    setUndoData({ book, timeoutId });
    setShowUndo(true);
    setBookToRemove(null);
    setConfirmRemoveModal(false);
  };

  const cancelRemoveFavorite = () => { setBookToRemove(null); setConfirmRemoveModal(false); };

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

  // Validación y manejo formulario manual
  const validateManual = () => {
    const e = {};
    if (!manualForm.title.trim()) e.title = 'Título requerido';
    if (!manualForm.author.trim()) e.author = 'Autor requerido';
    if (manualForm.year && !/^[0-9]{3,4}$/.test(manualForm.year)) e.year = 'Año inválido';
    if (manualForm.isbn && manualForm.isbn.length < 5) e.isbn = 'ISBN muy corto';
    return e;
  };

  const handleManualSubmit = (ev) => {
    ev.preventDefault();
    const e = validateManual();
    setManualErrors(e);
    if (Object.keys(e).length) return;
    const newBook = {
      id: 'manual-' + Date.now(),
      title: manualForm.title.trim(),
      author: manualForm.author.trim(),
      year: manualForm.year.trim(),
      isbn: manualForm.isbn.trim(),
      thumbnail: manualForm.thumbnail.trim() || '/placeholder-book.png',
      source: 'Manual'
    };
    const updated = FavoriteService.add(newBook);
    setFavorites(updated);
    setManualForm({ title:'', author:'', year:'', isbn:'', thumbnail:'' });
    setShowAddModal(false);
  };

  if (initialLoading) return (<div className="loading"><div className="loading-spinner"></div><p>Cargando libros...</p></div>);

  return (
    <div className="home-container">
      <section className="search-section home-search-stack">
        <div className="home-search-header">
          <h2 className="home-search-title">Explora la Biblioteca Multifuente</h2>
          <div className="home-search-actions">
            <button type="button" onClick={()=>setGroupBySource(g=>!g)} className="btn btn-secondary btn-sm" title="Agrupar por fuente">{groupBySource ? '🔀 Mezclar' : '🗂️ Agrupar'}</button>
            <button type="button" onClick={()=>setShowAddModal(true)} className="btn btn-accent btn-sm" aria-label="Agregar libro manual">➕ Agregar Manual</button>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="search-form" role="search" aria-label="Buscar libros">
          <input type="text" placeholder="Buscar por título, autor o tema..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Término de búsqueda" />
          <button type="submit" disabled={searching}>{searching ? 'Buscando...' : 'Buscar'}</button>
          {lastQuery && <button type="button" onClick={handleClearSearch}>Limpiar</button>}
        </form>
        <div className="home-filters-bar">
          <div className="filter-group">
            <label>Ordenar:</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Ordenar por">
              <option value="title">Título</option>
              <option value="year">Año</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Fuente:</label>
            <select value={filterSource} onChange={e=>setFilterSource(e.target.value)} aria-label="Filtrar fuente">
              <option value="">Todas</option>
              <option value="Google Books">Google Books</option>
              <option value="Open Library">Open Library</option>
              <option value="ISBNdb">ISBNdb</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
          {(filterSource || sortBy !== 'title') && (
            <button type="button" className="btn btn-sm btn-secondary" onClick={()=>{setFilterSource(''); setSortBy('title');}} title="Limpiar filtros">Reset</button>
          )}
        </div>
        <div className="home-search-meta">
          {lastQuery && <p className="home-search-result-label">Resultados para: <strong>{lastQuery}</strong></p>}
          <span className="home-search-count">Mostrando {groupBySource ? (groupedBooks?.reduce((n,[,arr])=>n+arr.length,0) || 0) : visibleBooks.length} libros</span>
        </div>
      </section>

      <div className="books-section">
  <h3 className="home-section-title">{lastQuery ? 'Resultados' : 'Libros Populares'} {groupBySource && <small className="home-group-badge">Agrupado por fuente</small>}</h3>
        {!groupBySource && (
          <div className="books-grid">
            {visibleBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                isFavorite={isFavorite(book.id)}
                onAddToFavorites={addToFavorites}
                onRemoveFromFavorites={requestRemoveFavorite}
                className="fade-in"
                variant="compact"
              />
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
                    <BookCard
                      key={book.id}
                      book={book}
                      isFavorite={isFavorite(book.id)}
                      onAddToFavorites={addToFavorites}
                      onRemoveFromFavorites={requestRemoveFavorite}
                      className="fade-in"
                      variant="compact"
                    />
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
      {/* Modal confirmación eliminar favorito (Inicio) */}
      <Modal mostrar={confirmRemoveModal} onCerrar={cancelRemoveFavorite} titulo="Confirmar eliminación">
        <p style={{marginBottom:'18px'}}>¿Eliminar <strong>{bookToRemove?.title}</strong> de tus favoritos?</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={cancelRemoveFavorite}>Cancelar</button>
          <button type="button" className="btn btn-danger" onClick={confirmRemoveFavorite}>Eliminar</button>
        </div>
      </Modal>

      {/* Modal agregar manual (Inicio) */}
      <Modal mostrar={showAddModal} onCerrar={()=>setShowAddModal(false)} titulo="Agregar Libro Favorito">
        <form onSubmit={handleManualSubmit} className="add-fav-form">
          <div>
            <label>Título *</label>
            <input value={manualForm.title} onChange={e=>setManualForm(f=>({...f,title:e.target.value}))} placeholder="Ej: El Principito" />
            {manualErrors.title && <small className="error-message">{manualErrors.title}</small>}
          </div>
          <div>
            <label>Autor *</label>
            <input value={manualForm.author} onChange={e=>setManualForm(f=>({...f,author:e.target.value}))} placeholder="Autor" />
            {manualErrors.author && <small className="error-message">{manualErrors.author}</small>}
          </div>
          <div className="fav-form-row">
            <div className="fav-flex-1">
              <label>Año</label>
              <input value={manualForm.year} onChange={e=>setManualForm(f=>({...f,year:e.target.value}))} placeholder="1998" />
              {manualErrors.year && <small className="error-message">{manualErrors.year}</small>}
            </div>
            <div className="fav-flex-2">
              <label>ISBN</label>
              <input value={manualForm.isbn} onChange={e=>setManualForm(f=>({...f,isbn:e.target.value}))} placeholder="978-..." />
              {manualErrors.isbn && <small className="error-message">{manualErrors.isbn}</small>}
            </div>
          </div>
          <div>
            <label>URL Imagen (opcional)</label>
            <input value={manualForm.thumbnail} onChange={e=>setManualForm(f=>({...f,thumbnail:e.target.value}))} placeholder="https://..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={()=>setShowAddModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeView;