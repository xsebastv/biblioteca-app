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
    no_favorites_desc: 'Agrega libros a tus favoritos desde la página principal',
    description: 'Descripción',
    genre: 'Género',
    language: 'Idioma',
    not_found: 'No encontrado',
    go_back: 'Volver',
    brand_title: 'Biblioteca Digital',
    landing: 'Landing',
    limited_info: 'Información limitada',
    limited_info_warning: 'No se pudo obtener toda la información desde la fuente original.',
    footer_project: 'Proyecto Biblioteca Digital',
    footer_made_by: 'Hecho con ❤ por {authors}.',
    footer_meta: '2025 · UI clara y alegre · Uso académico'
  ,limited_source_placeholder: 'Información limitada'
  ,favorites_sub: 'Tu colección personal de libros favoritos'
  ,undo: 'Deshacer'
  ,close: 'Cerrar'
  ,limited_source_openlib: 'Open Library (información limitada)'
  ,limited_source_isbndb: 'ISBNdb (información limitada)'
  ,limited_source_google: 'Google Books (información limitada)'
  ,limited_error_banner: 'Información limitada disponible - No se pudo conectar con la fuente original'
  ,limited_author_placeholder: 'Autor no disponible - Intenta agregar a favoritos para ver si hay más información'
  ,limited_description_intro: 'Lo sentimos, no pudimos obtener la información completa de este libro desde {source}.'
  ,limited_description_reasons: 'Esto puede ocurrir por:\n• Conexión temporalmente no disponible\n• El libro fue eliminado de la fuente original\n• Restricciones de la API externa'
  ,limited_description_suggestions: 'Puedes intentar:\n• Refrescar la página\n• Buscar el libro nuevamente\n• Agregarlo a favoritos para conservar la información básica'
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
    description: 'Description',
    genre: 'Genre',
    language: 'Language',
    not_found: 'Not found',
    go_back: 'Go back',
    confirm_remove_text: 'Are you sure you want to remove this book from your favorites?',
    cancel: 'Cancel',
    confirm: 'Remove',
    back: 'Back',
    brand_title: 'Digital Library',
    landing: 'Landing',
    limited_info: 'Limited info',
    limited_info_warning: 'Could not fetch full information from the original source.',
    footer_project: 'Digital Library Project',
    footer_made_by: 'Made with ❤ by {authors}.',
    footer_meta: '2025 · Clear & joyful UI · Academic use'
  ,limited_source_placeholder: 'Limited information'
  ,favorites_sub: 'Your personal favorite books collection'
  ,undo: 'Undo'
  ,close: 'Close'
  ,limited_source_openlib: 'Open Library (limited info)'
  ,limited_source_isbndb: 'ISBNdb (limited info)'
  ,limited_source_google: 'Google Books (limited info)'
  ,limited_error_banner: 'Limited information available - Could not connect to the original source'
  ,limited_author_placeholder: 'Author unavailable - Try adding to favorites to see if more info appears'
  ,limited_description_intro: 'Sorry, we could not fetch full information for this book from {source}.'
  ,limited_description_reasons: 'This may happen due to:\n• Temporarily unavailable connection\n• The book was removed at the original source\n• External API restrictions'
  ,limited_description_suggestions: 'You can try:\n• Refreshing the page\n• Searching the book again\n• Adding it to favorites to keep the basic info'
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
