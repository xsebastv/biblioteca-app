import React, { useEffect, useState } from 'react';
import FavoriteService from '../services/FavoriteService';
import './FavoritesView.css';
import Modal from '../components/Modal';

const FavoritesView = () => {
  const [favorites, setFavorites] = useState([]);
  const [undoData, setUndoData] = useState(null); // { book, timeoutId }
  const [showUndo, setShowUndo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  const [form, setForm] = useState({ title:'', author:'', year:'', isbn:'', thumbnail:'' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(FavoriteService.getAll());
  };

  const openRemoveConfirm = (book) => { setBookToRemove(book); setShowConfirmModal(true); };
  const confirmRemove = () => {
    if (!bookToRemove) return;
    const book = bookToRemove;
    const updated = FavoriteService.remove(book.id);
    setFavorites(updated);
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    const timeoutId = setTimeout(() => { setShowUndo(false); setUndoData(null); }, 5000);
    setUndoData({ book, timeoutId });
    setShowUndo(true);
    setBookToRemove(null);
    setShowConfirmModal(false);
  };
  const cancelRemove = () => { setBookToRemove(null); setShowConfirmModal(false); };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Título requerido';
    if (!form.author.trim()) e.author = 'Autor requerido';
    if (form.year && !/^[0-9]{3,4}$/.test(form.year)) e.year = 'Año inválido';
    if (form.isbn && form.isbn.length < 5) e.isbn = 'ISBN muy corto';
    return e;
  };

  const handleAddFavorite = (ev) => {
    ev.preventDefault();
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    const newBook = {
      id: 'manual-' + Date.now(),
      title: form.title.trim(),
      author: form.author.trim(),
      year: form.year.trim(),
      isbn: form.isbn.trim(),
      thumbnail: form.thumbnail.trim() || '/placeholder-book.png',
      source: 'Manual'
    };
    const updated = FavoriteService.add(newBook);
    setFavorites(updated);
    setForm({ title:'', author:'', year:'', isbn:'', thumbnail:'' });
    setShowAddModal(false);
  };

  const handleUndo = () => {
    if (undoData?.book) {
      const updated = FavoriteService.add(undoData.book);
      setFavorites(updated);
    }
    if (undoData?.timeoutId) clearTimeout(undoData.timeoutId);
    setUndoData(null);
    setShowUndo(false);
  };

    // Aplica clase dark al contenedor si corresponde
    return (
      <div className="favorites-container"> 
      <div className="favorites-header">
        <h1>💖 Mis Libros Favoritos</h1>
        <p>Gestiona tu colección personal de libros favoritos</p>
        <div style={{marginTop:'18px'}}>
          <button className="btn-primary btn" type="button" onClick={()=>setShowAddModal(true)}>➕ Agregar Libro Manual</button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <h3>No tienes libros favoritos aún</h3>
          <p>Agrega libros a tus favoritos desde la página principal</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map(book => (
            <div key={book.id} className="book-card fade-in favorite-active" style={{position:'relative'}}>
              <div className="favorite-ribbon">Favorito</div>
              <div className="book-thumb-wrapper" style={{width:'100%', height:'160px', borderRadius:'12px', overflow:'hidden', background:'#f0f3f9', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px'}}>
                <img src={book.thumbnail || '/placeholder-book.png'} alt={book.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
              <div className="book-info" style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                <h3 className="book-title" style={{margin:0}}>{book.title || 'Título no disponible'}</h3>
                <p className="book-author" style={{margin:0,fontSize:'0.75rem'}}><strong>Autor:</strong> {book.author || 'Autor desconocido'}</p>
                <p className="book-year" style={{margin:0,fontSize:'0.7rem'}}><strong>Año:</strong> {book.year || 'N/D'}</p>
                {book.isbn && <p className="book-year" style={{margin:0,fontSize:'0.7rem'}}><strong>ISBN:</strong> {book.isbn}</p>}
              </div>
              <button
                className="favorite-float-btn active"
                title="Eliminar de favoritos"
                onClick={() => openRemoveConfirm(book)}
                style={{position:'absolute', top:'10px', right:'10px'}}
              >
                <span className="favorite-icon">💔</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showUndo && undoData?.book && (
        <div style={{position:'fixed', left:'50%', bottom:'30px', transform:'translateX(-50%)', background:'#323232', color:'#fff', padding:'14px 22px', borderRadius:'8px', display:'flex', gap:'18px', alignItems:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.3)', zIndex:1000}} role="status" aria-live="polite">
          <span>Eliminado: {undoData.book.title}</span>
          <button onClick={handleUndo} style={{background:'transparent', border:'1px solid #888', color:'#fff', padding:'6px 14px', borderRadius:'6px', cursor:'pointer'}}>
            Deshacer
          </button>
          <button onClick={()=>{setShowUndo(false); if(undoData?.timeoutId) clearTimeout(undoData.timeoutId);}} aria-label="Cerrar" style={{background:'transparent', border:'none', color:'#bbb', fontSize:'18px', cursor:'pointer'}}>×</button>
        </div>
      )}

      {/* Modal Agregar */}
      <Modal mostrar={showAddModal} onCerrar={()=>setShowAddModal(false)} titulo="Agregar Libro Favorito">
        <form onSubmit={handleAddFavorite} className="add-fav-form" style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          <div>
            <label>Título *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Ej: El Principito" />
            {errors.title && <small style={{color:'#dc2626'}}>{errors.title}</small>}
          </div>
          <div>
            <label>Autor *</label>
            <input value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} placeholder="Autor" />
            {errors.author && <small style={{color:'#dc2626'}}>{errors.author}</small>}
          </div>
            <div style={{display:'flex', gap:'12px'}}>
              <div style={{flex:1}}>
                <label>Año</label>
                <input value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="1998" />
                {errors.year && <small style={{color:'#dc2626'}}>{errors.year}</small>}
              </div>
              <div style={{flex:2}}>
                <label>ISBN</label>
                <input value={form.isbn} onChange={e=>setForm(f=>({...f,isbn:e.target.value}))} placeholder="978-..." />
                {errors.isbn && <small style={{color:'#dc2626'}}>{errors.isbn}</small>}
              </div>
            </div>
          <div>
            <label>URL Imagen (opcional)</label>
            <input value={form.thumbnail} onChange={e=>setForm(f=>({...f,thumbnail:e.target.value}))} placeholder="https://..." />
          </div>
          <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'4px'}}>
            <button type="button" className="btn btn-secondary" onClick={()=>setShowAddModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmación */}
      <Modal mostrar={showConfirmModal} onCerrar={cancelRemove} titulo="Confirmar eliminación">
        <p style={{marginBottom:'18px'}}>¿Seguro que deseas eliminar <strong>{bookToRemove?.title}</strong> de tus favoritos?</p>
        <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
          <button type="button" className="btn btn-secondary" onClick={cancelRemove}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={confirmRemove}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
};

export default FavoritesView;