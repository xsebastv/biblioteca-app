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
  const [dark, setDark] = useState(false);
  const [groupBySource, setGroupBySource] = useState(false);

  const sentinelRef = useRef(null);

  useEffect(() => { loadInitial(); loadFavorites(); }, []);

  // Sincronizar clase global para modo oscuro
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [dark]);

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
    if (!book || addingIds.has(book.id)) return;
    setAddingIds(prev => new Set(prev).add(book.id));
    const updated = FavoriteService.add(book);
    setFavorites(updated);
    // pequeña ventana para prevenir doble click
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
      <section className="search-section" style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px', flexWrap:'wrap'}}>
          <h2 style={{margin:0}}>Explora la Biblioteca Multifuente</h2>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
            <button type="button" onClick={()=>setDark(d=>!d)} style={{padding:'8px 14px', borderRadius:'8px', border:'1px solid #999', background: dark ? '#222' : '#fafafa', color: dark ? '#eee':'#333', cursor:'pointer'}}>{dark ? '☀️ Claro' : '🌙 Oscuro'}</button>
            <button type="button" onClick={()=>setGroupBySource(g=>!g)} style={{padding:'8px 14px', borderRadius:'8px', border:'1px solid #999', background:'#fff', cursor:'pointer'}}>{groupBySource ? '🔀 Mezclar' : '🗂️ Agrupar'}</button>
          </div>
        </div>
        <form onSubmit={handleSearchSubmit} className="search-form" role="search" aria-label="Buscar libros">
          <input type="text" placeholder="Buscar por título, autor o tema..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Término de búsqueda" />
          <button type="submit" disabled={searching}>{searching ? 'Buscando...' : 'Buscar'}</button>
          {lastQuery && <button type="button" onClick={handleClearSearch}>Limpiar</button>}
        </form>
        <div style={{display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center'}}>
          {lastQuery && <p style={{margin:'4px 0', fontSize:'0.9rem'}}>Resultados para: <strong>{lastQuery}</strong></p>}
          <span style={{fontSize:'0.8rem', background:'#eee', padding:'4px 10px', borderRadius:'20px'}}>Mostrando {books.length} libros</span>
        </div>
      </section>

      <div className="books-section">
        <h3 style={{display:'flex', alignItems:'center', gap:'12px'}}>{lastQuery ? 'Resultados' : 'Libros Populares'} {groupBySource && <small style={{fontWeight:400, fontSize:'0.75rem', background:'#ddd', padding:'4px 8px', borderRadius:'6px'}}>Agrupado por fuente</small>}</h3>
        {!groupBySource && (
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className={`book-card fade-in ${isFavorite(book.id) ? 'favorite-active' : ''}`}> 
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
                  <p className={`book-source-badge source-${book.source.toLowerCase().replace(/\s+/g,'-')}`}>{book.source}</p>
                </div>
                      <div className="book-actions">
                        {isFavorite(book.id) ? (
                          <button className="btn btn-remove" style={{fontSize:'1.15rem', padding:'14px 32px', borderRadius:'24px', margin:'0 auto', display:'flex', alignItems:'center', gap:'10px'}} onClick={()=>handleRemoveFromFavorites(book)} title="Quitar de favoritos">
                            <span role="img" aria-label="Quitar favorito">💔</span> Quitar
                          </button>
                        ) : (
                          <button className="btn btn-add" style={{fontSize:'1.15rem', padding:'14px 32px', borderRadius:'24px', margin:'0 auto', display:'flex', alignItems:'center', gap:'10px'}} disabled={addingIds.has(book.id)} onClick={()=>addToFavorites(book)} title="Agregar a favoritos">
                            <span role="img" aria-label="Favorito">💖</span> Favorito
                          </button>
                        )}
                      </div>
              </div>
            ))}
          </div>
        )}
        {groupBySource && (
          <div style={{display:'flex', flexDirection:'column', gap:'40px'}}>
            {groupedBooks.map(([source, list]) => (
              <section key={source} style={{border:'1px solid #e2e2e2', borderRadius:'16px', padding:'16px 20px', background:'var(--group-bg, #fff)'}}>
                <h4 style={{margin:'0 0 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <span className={`book-source-badge source-${source.toLowerCase().replace(/\s+/g,'-')}`}>{source}</span>
                  <small style={{fontWeight:400, fontSize:'0.7rem', opacity:.7}}>{list.length} libros</small>
                </h4>
                <div className="books-grid">
                  {list.map(book => (
                    <div key={book.id} className={`book-card fade-in ${isFavorite(book.id) ? 'favorite-active' : ''}`}> 
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
                      <div className="book-actions">
                        {isFavorite(book.id) ? (
                          <button className="btn btn-remove" style={{fontSize:'1.15rem', padding:'14px 32px', borderRadius:'24px', margin:'0 auto', display:'flex', alignItems:'center', gap:'10px'}} onClick={()=>handleRemoveFromFavorites(book)} title="Quitar de favoritos">
                            <span role="img" aria-label="Quitar favorito">💔</span> Quitar
                          </button>
                        ) : (
                          <button className="btn btn-add" style={{fontSize:'1.15rem', padding:'14px 32px', borderRadius:'24px', margin:'0 auto', display:'flex', alignItems:'center', gap:'10px'}} disabled={addingIds.has(book.id)} onClick={()=>addToFavorites(book)} title="Agregar a favoritos">
                            <span role="img" aria-label="Favorito">💖</span> Favorito
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <div ref={sentinelRef} style={{height:'1px'}} />
        {loading && !initialLoading && <p style={{textAlign:'center', marginTop:'20px'}}>Cargando más...</p>}
        {!hasMore && !loading && <p style={{textAlign:'center', marginTop:'20px', color:'#666'}}>No hay más resultados.</p>}
      </div>

  {/* Modal eliminado - eliminación directa con undo */}
    <style>{`
      :root { color-scheme: ${dark ? 'dark' : 'light'}; }
      body ${dark ? '' : ''}
      .home-container { transition: background .4s, color .4s; ${dark ? 'background:#121212; color:#e5e5e5;' : ''}}
      .book-card { display:grid; grid-template-columns:90px 1fr; gap:14px; }
      .book-thumb-wrapper { width:90px; height:120px; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,.15); background:#f5f5f5; display:flex; align-items:center; justify-content:center; }
      .book-thumb { width:100%; height:100%; object-fit:cover; filter:${dark ? 'brightness(.85)' : 'none'}; }
      .fade-in { animation:fadeInUp .55s ease both; }
      @keyframes fadeInUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
      ${dark ? '.book-card{background:#1e1e1e; border-color:#2a2a2a;} .books-section h3{color:#fafafa;} .book-source-badge{box-shadow:none;}' : ''}
    `}</style>
    </div>
  );
};

export default HomeView;