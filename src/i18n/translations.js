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
    unknown_author: 'Autor desconocido'
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
    unknown_author: 'Unknown author'
  }
};

export function createI18n(lang = 'es') {
  return function t(key) {
    const l = translations[lang] || translations.es;
    return l[key] || key;
  };
}
