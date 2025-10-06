// Servicio para gestionar favoritos de forma centralizada y segura
const STORAGE_KEY = 'favoriteBooks';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export default class FavoriteService {
  static getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = safeParse(data, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  static saveAll(favorites) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    // Emitir evento personalizado para actualización reactiva en la UI
    FavoriteService._emitChange(favorites);
  }

  static existsById(id) {
    return FavoriteService.getAll().some(f => f.id === id);
  }

  static findDuplicate(title, author) {
    const normalized = (s) => (s || '').trim().toLowerCase();
    const t = normalized(title);
    const a = normalized(author);
    return FavoriteService.getAll().some(f => normalized(f.title) === t && normalized(f.author) === a);
  }

  static add(book) {
    const current = FavoriteService.getAll();
    if (!book) { console.warn('[FavoriteService] add: libro undefined/null'); return [...current]; }
    if (!book.id) { console.warn('[FavoriteService] add: libro sin id', book); return [...current]; }
    if (FavoriteService.existsById(book.id)) {
      console.info('[FavoriteService] add: ya existe', book.id);
      return [...current];
    }
    // Agregar timestamp cuando se añade el libro
    const bookWithTimestamp = {
      ...book,
      addedAt: Date.now()
    };
    const updated = [...current, bookWithTimestamp];
    FavoriteService.saveAll(updated);
    console.info('[FavoriteService] add: agregado', book.id, 'total', updated.length);
    return updated;
  }

  static remove(id) {
    const updated = FavoriteService.getAll().filter(f => f.id !== id);
    FavoriteService.saveAll(updated);
    return updated;
  }

  /**
   * Dispara un CustomEvent para que otros componentes (ej. Header/App) escuchen
   * y actualicen contadores sin depender del evento 'storage' (que no se dispara
   * en la misma pestaña). Detalle incluye lista y count.
   */
  static _emitChange(currentList) {
    try {
      const favorites = currentList || FavoriteService.getAll();
      const event = new CustomEvent('favorites:changed', { detail: { count: favorites.length, favorites } });
      window.dispatchEvent(event);
    } catch (e) {
      // Silencioso: no debe romper la app si el dispatch falla
      console.warn('No se pudo emitir evento favorites:changed', e);
    }
  }
}
