export const translations = {
  es: {
    favorite_add: 'Favorito +',
    favorite_remove: 'Quitar',
    favorite_mark: 'Agregar a favoritos',
    favorite_unmark: 'Quitar de favoritos',
    favorite_label: 'Favorito',
    view_more: 'Ver más',
    view_less: 'Ver menos',
    source: 'Fuente',
    pages_short: 'págs',
    pages: 'Páginas',
    year: 'Año',
    isbn: 'ISBN',
    unknown_author: 'Autor desconocido',
    home: 'Inicio',
    favorites: 'Favoritos',
    search_placeholder: 'Buscar libros por título, autor...',
    search_button: 'Buscar',
    no_results: 'No se encontraron libros',
    loading: 'Cargando...',
    error: 'Error al cargar los libros',
    confirm_remove: '¿Eliminar de favoritos?',
    remove_favorite_message: '¿Estás seguro de que quieres eliminar "{title}" de tus favoritos?',
    remove: 'Eliminar',
    cancel: 'Cancelar',
    confirm: 'Eliminar',
    back: 'Volver',
    sort_by: 'Ordenar:',
    sort_title: 'Título',
    sort_year: 'Año',
    no_favorites: 'No tienes libros favoritos aún',
    no_favorites_desc: 'Agrega libros a tus favoritos desde la página principal'
  },
  en: {
    favorite_add: 'Favorite +',
    favorite_remove: 'Remove',
    favorite_mark: 'Add to favorites',
    favorite_unmark: 'Remove from favorites',
    favorite_label: 'Favorite',
    view_more: 'View more',
    view_less: 'View less',
    source: 'Source',
    pages_short: 'pages',
    pages: 'Pages',
    year: 'Year',
    isbn: 'ISBN',
    unknown_author: 'Unknown author',
    home: 'Home',
    favorites: 'Favorites',
    search_placeholder: 'Search books by title, author...',
    search_button: 'Search',
    no_results: 'No books found',
    loading: 'Loading...',
    error: 'Error loading books',
    confirm_remove: 'Remove from favorites?',
    remove_favorite_message: 'Are you sure you want to remove "{title}" from your favorites?',
    remove: 'Remove',
    cancel: 'Cancel',
    sort_by: 'Sort by:',
    sort_title: 'Title',
    sort_year: 'Year',
    no_favorites: 'You have no favorite books yet',
    no_favorites_desc: 'Add books to your favorites from the main page',
    confirm_remove_text: 'Are you sure you want to remove this book from your favorites?',
    cancel: 'Cancel',
    confirm: 'Remove',
    back: 'Back'
  }
};

export function createI18n(lang = 'es') {
  return function t(key, params = {}) {
    const l = translations[lang] || translations.es;
    let text = l[key] || key;
    
    // Reemplazar parámetros {param} en el texto
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
      });
    }
    
    return text;
  };
}
