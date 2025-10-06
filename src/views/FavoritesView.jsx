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
        <h1 className="fav-title">💖 Mis Libros Favoritos</h1>
        <p className="fav-sub">Gestiona tu colección personal de libros favoritos</p>
        <div className="fav-actions">
          <button className="btn btn-primary" type="button" onClick={()=>setShowAddModal(true)}>➕ Agregar Libro Manual</button>
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
            <div key={book.id} className="book-card fade-in favorite-active fav-card">
              <div className="favorite-ribbon">Favorito</div>
              <div className="fav-thumb">
                <img src={book.thumbnail || '/placeholder-book.png'} alt={book.title} className="fav-thumb-img" />
              </div>
              <div className="book-info fav-info">
                <h3 className="book-title fav-book-title">{book.title || 'Título no disponible'}</h3>
                <p className="book-author fav-meta"><strong>Autor:</strong> {book.author || 'Autor desconocido'}</p>
                <p className="book-year fav-meta"><strong>Año:</strong> {book.year || 'N/D'}</p>
                {book.isbn && <p className="book-year fav-meta"><strong>ISBN:</strong> {book.isbn}</p>}
              </div>
              <button
                className="favorite-float-btn active fav-remove"
                title="Eliminar de favoritos"
                onClick={() => openRemoveConfirm(book)}
              >
                <span className="favorite-icon">💔</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showUndo && undoData?.book && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span className="undo-text">Eliminado: {undoData.book.title}</span>
          <button onClick={handleUndo} className="undo-btn">Deshacer</button>
          <button onClick={()=>{setShowUndo(false); if(undoData?.timeoutId) clearTimeout(undoData.timeoutId);}} aria-label="Cerrar" className="undo-close">×</button>
        </div>
      )}

      {/* Modal Agregar */}
      <Modal mostrar={showAddModal} onCerrar={()=>setShowAddModal(false)} titulo="Agregar Libro Favorito">
  <form onSubmit={handleAddFavorite} className="add-fav-form">
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
            <div className="fav-form-row">
              <div className="fav-flex-1">
                <label>Año</label>
                <input value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} placeholder="1998" />
                {errors.year && <small style={{color:'#dc2626'}}>{errors.year}</small>}
              </div>
              <div className="fav-flex-2">
                <label>ISBN</label>
                <input value={form.isbn} onChange={e=>setForm(f=>({...f,isbn:e.target.value}))} placeholder="978-..." />
                {errors.isbn && <small style={{color:'#dc2626'}}>{errors.isbn}</small>}
              </div>
            </div>
          <div>
            <label>URL Imagen (opcional)</label>
            <input value={form.thumbnail} onChange={e=>setForm(f=>({...f,thumbnail:e.target.value}))} placeholder="https://..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={()=>setShowAddModal(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirmación */}
      <Modal mostrar={showConfirmModal} onCerrar={cancelRemove} titulo="Confirmar eliminación">
        <p style={{marginBottom:'18px'}}>¿Seguro que deseas eliminar <strong>{bookToRemove?.title}</strong> de tus favoritos?</p>
  <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={cancelRemove}>Cancelar</button>
            <button type="button" className="btn btn-danger" onClick={confirmRemove}>Eliminar</button>
        </div>
      </Modal>
    </div>
  );
};

export default FavoritesView;