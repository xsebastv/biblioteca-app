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
      <section className="search-section" style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'16px', flexWrap:'wrap'}}>
          <h2 style={{margin:0}}>Explora la Biblioteca Multifuente</h2>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
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
                  <p className={`book-source-badge source-${book.source.toLowerCase().replace(/\s+/g,'-')}`}>{book.source}</p>
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
                        style={{position:'absolute', top:'8px', right:'8px', zIndex:2}}
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
        {loading && !initialLoading && <p style={{textAlign:'center', marginTop:'20px'}}>Cargando más...</p>}
        {!hasMore && !loading && <p style={{textAlign:'center', marginTop:'20px', color:'#666'}}>No hay más resultados.</p>}
      </div>

  {/* Modal eliminado - eliminación directa con undo */}
    <style>{`
      .book-card { display:grid; grid-template-columns:90px 1fr; gap:14px; position:relative; background:#ffffff; border:1px solid #ececec; border-radius:16px; padding:14px 14px 16px; box-shadow:0 4px 10px -2px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.04); }
      .book-card.favorite-active { border-color:#ff6b6b; box-shadow:0 4px 14px -2px rgba(255,107,107,0.3), 0 2px 6px -2px rgba(255,107,107,0.25); }
      .book-card:hover { transform:translateY(-4px); transition:all .35s cubic-bezier(.4,0,.2,1); box-shadow:0 10px 24px -6px rgba(0,0,0,0.15), 0 4px 8px -4px rgba(0,0,0,0.08); }
      .book-thumb-wrapper { width:90px; height:124px; border-radius:10px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,.12); background:linear-gradient(135deg,#f0f3f9,#e2e8f0); display:flex; align-items:center; justify-content:center; position:relative; }
      .book-thumb { width:100%; height:100%; object-fit:cover; }
      .favorite-float-btn { position:absolute; background:linear-gradient(135deg,#ffffff,#f7f7f7); border:2px solid #ff6b6b; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(255,107,107,0.25); cursor:pointer; transition:all .25s; top:8px; right:8px; }
      .favorite-float-btn:hover { background:linear-gradient(135deg,#ff6b6b 0%,#ff5252 100%); border-color:#ff5252; transform:scale(1.08); color:#fff; }
      .favorite-float-btn.active { background:linear-gradient(135deg,#ff6b6b 0%,#ff5252 100%); color:#fff; }
      .favorite-icon { font-size:1rem; }
      .book-info { display:flex; flex-direction:column; gap:4px; }
      .book-title { font-size:0.95rem; line-height:1.2; font-weight:700; color:#222; margin:0 0 4px; }
      .book-author, .book-year { font-size:0.7rem; color:#555; margin:0; }
      .book-source-badge { margin-top:4px; display:inline-block; font-size:0.55rem; letter-spacing:.5px; text-transform:uppercase; background:#eef2ff; color:#3949ab; padding:4px 8px; border-radius:20px; font-weight:600; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
      .favorite-ribbon { position:absolute; top:0; right:0; background:linear-gradient(135deg,#ff6b6b,#ff914d); color:#fff; font-size:0.55rem; font-weight:700; padding:4px 10px 4px 12px; border-bottom-left-radius:12px; letter-spacing:.5px; box-shadow:0 4px 12px -2px rgba(255,107,107,0.4); animation:popIn .45s ease; }
      @keyframes popIn { 0% { transform:translateY(-10px) scale(.9); opacity:0;} 100% { transform:translateY(0) scale(1); opacity:1;} }
      .search-form { display:flex; gap:8px; }
      .search-form input { flex:1; padding:10px 14px; border:1px solid #d1d5db; border-radius:12px; font-size:0.9rem; background:#fff; }
      .search-form button { background:#6366f1; color:#fff; border:none; padding:10px 16px; border-radius:12px; cursor:pointer; font-weight:600; font-size:0.85rem; box-shadow:0 4px 14px -2px rgba(99,102,241,0.4); transition:background .25s, transform .25s; }
      .search-form button:hover { background:#4f46e5; transform:translateY(-2px); }
      .books-grid { display:grid; gap:18px; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }
      @media (max-width:600px){ .books-grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:14px;} .book-card{grid-template-columns:70px 1fr; padding:10px 10px 12px;} .book-thumb-wrapper{width:70px; height:100px;} .favorite-float-btn{width:26px; height:26px;} .book-title{font-size:0.8rem;} }
    `}</style>
    </div>
  );
};

export default HomeView;