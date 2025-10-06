/**
 * Servicio para la gestión centralizada de libros favoritos
 * 
 * Características principales:
 * - Persistencia en localStorage
 * - Sistema de eventos para actualizaciones en tiempo real
 * - Validación y normalización de datos
 * - Prevención de duplicados
 * - Timestamps para ordenamiento
 * 
 * @module FavoriteService
 */

const STORAGE_KEY = 'favoriteBooks';

/**
 * Función auxiliar para parsear JSON de forma segura
 * @param {string} json - String JSON a parsear
 * @param {any} fallback - Valor por defecto si el parsing falla
 * @returns {any} Resultado del parsing o fallback
 */
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export default class FavoriteService {
  /**
   * Recupera todos los libros favoritos almacenados
   * @returns {Array} Lista de libros favoritos
   */
  static getAll() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = safeParse(data, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  /**
   * Guarda la lista completa de favoritos y notifica cambios
   * @param {Array} favorites - Lista de favoritos a guardar
   */
  static saveAll(favorites) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    // Emitir evento para actualización reactiva en la UI
    FavoriteService._emitChange(favorites);
  }

  /**
   * Verifica si un libro ya existe por su ID
   * @param {string} id - ID del libro a verificar
   * @returns {boolean} true si existe, false si no
   */
  static existsById(id) {
    return FavoriteService.getAll().some(f => f.id === id);
  }

  /**
   * Busca duplicados por título y autor
   * @param {string} title - Título del libro
   * @param {string} author - Autor del libro
   * @returns {boolean} true si encuentra duplicado, false si no
   */
  static findDuplicate(title, author) {
    const normalized = (s) => (s || '').trim().toLowerCase();
    const t = normalized(title);
    const a = normalized(author);
    return FavoriteService.getAll().some(f => 
      normalized(f.title) === t && normalized(f.author) === a
    );
  }

  /**
   * Agrega un libro a favoritos
   * - Valida que el libro sea válido
   * - Verifica duplicados
   * - Agrega timestamp para ordenamiento
   * - Notifica cambios mediante eventos
   * 
   * @param {Object} book - Libro a agregar
   * @returns {Array} Lista actualizada de favoritos
   */
  static add(book) {
    const current = FavoriteService.getAll();
    
    // Validaciones
    if (!book) { 
      console.warn('[FavoriteService] Error: Libro indefinido o nulo');
      return [...current];
    }
    if (!book.id) {
      console.warn('[FavoriteService] Error: Libro sin ID', book);
      return [...current];
    }
    if (FavoriteService.existsById(book.id)) {
      console.info('[FavoriteService] Info: Libro ya existe en favoritos', book.id);
      return [...current];
    }

    // Agregar timestamp para ordenamiento
    const bookWithTimestamp = {
      ...book,
      addedAt: Date.now()
    };

    // Actualizar lista y notificar
    const updated = [...current, bookWithTimestamp];
    FavoriteService.saveAll(updated);
    console.info('[FavoriteService] add: agregado', book.id, 'total', updated.length);
    return updated;
  }

  /**
   * Elimina un libro de favoritos por su ID
   * @param {string} id - ID del libro a eliminar
   * @returns {Array} Lista actualizada de favoritos
   */
  static remove(id) {
    const updated = FavoriteService.getAll().filter(f => f.id !== id);
    FavoriteService.saveAll(updated);
    return updated;
  }

  /**
   * Emite un evento personalizado para notificar cambios en favoritos
   * 
   * Este método:
   * 1. Notifica a otros componentes sobre cambios en favoritos
   * 2. Permite actualización reactiva sin depender del evento 'storage'
   * 3. Incluye tanto el conteo como la lista completa en el evento
   * 
   * @param {Array} currentList - Lista actual de favoritos
   * @private
   */
  static _emitChange(currentList) {
    try {
      const favorites = currentList || FavoriteService.getAll();
      const event = new CustomEvent('favorites:changed', {
        detail: {
          count: favorites.length,
          favorites
        }
      });
      window.dispatchEvent(event);
    } catch (e) {
      // Error silencioso para no interrumpir la UI
      console.warn('No se pudo emitir evento favorites:changed', e);
    }
  }
}
