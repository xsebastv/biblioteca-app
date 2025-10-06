/**
 * Servicio para obtener libros desde múltiples APIs públicas
 * - Google Books API
 * - Open Library API
 * - ISBNdb API (requiere API key: VITE_ISBNDB_KEY)
 * Unifica el modelo de datos y aplica deduplicación y fallback.
 */
class BookService {
  // Caché simple para libros ya cargados
  static _bookCache = new Map();
  
  /**
   * Guardar libros en caché para acceso rápido posterior
   */
  static _cacheBooks(books) {
    books.forEach(book => {
      if (book && book.id) {
        this._bookCache.set(book.id, book);
      }
    });
  }
  static BASE_URL_GOOGLE = 'https://www.googleapis.com/books/v1/volumes';
  static BASE_URL_OPENLIB = 'https://openlibrary.org/search.json';
  static BASE_URL_ISBNDB = 'https://api2.isbndb.com/search'; // Nota: endpoint aproximado; puede ajustarse según documentación
  
  /**
   * Obtener una página de resultados combinando todas las fuentes.
   * page inicia en 1. pageSize total combinado.
   */
  static async obtenerPaginaLibros(query = 'programming', page = 1, pageSize = 18) {
    const q = query && query.trim() ? query.trim() : 'programming';
    const porFuente = Math.max(3, Math.ceil(pageSize / 3));
    try {
      const [g, o, i] = await Promise.allSettled([
        this.obtenerLibrosGooglePaginado(q, page, porFuente),
        this.obtenerLibrosOpenLibraryPaginado(q, page, porFuente),
        this.obtenerLibrosIsbnDbPaginado(q, page, porFuente)
      ]);
      const listas = [g, o, i].map(r => r.status === 'fulfilled' ? r.value : []);
      const combinados = this._combinarYDepurar(listas, pageSize * page); // combinados acumulados hipotéticos
      /** Tomar sólo la "ventana" de la página solicitada */
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return combinados.slice(start, end);
    } catch (e) {
      console.error('Error obtenerPaginaLibros:', e);
      return [];
    }
  }

  /**
   * Obtener libros populares combinando múltiples fuentes (consulta genérica)
   */
  static async obtenerLibrosPopulares() {
    const query = 'programming';
    try {
      // Aumentamos la cantidad por fuente para mostrar aún más libros en el inicio
      const porFuente = 30; // antes 20
      const limiteTotal = 90; // antes 60
      const [google, openLib, isbn] = await this._cargarFuentesParalelo(query, porFuente);
      const combinados = this._combinarYDepurar([google, openLib, isbn], limiteTotal);
      return combinados.length ? combinados : this.obtenerLibrosRespaldo();
    } catch (e) {
      console.error('Error obtenerLibrosPopulares:', e);
      return this.obtenerLibrosRespaldo();
    }
  }

  /**
   * Buscar libros en múltiples APIs
   */
  static async buscarLibros(consulta) {
    if (!consulta || consulta.trim() === '') return this.obtenerLibrosPopulares();
    try {
      const [google, openLib, isbn] = await this._cargarFuentesParalelo(consulta.trim(), 6);
      return this._combinarYDepurar([google, openLib, isbn], 30);
    } catch (e) {
      console.error('Error en búsqueda multi-API:', e);
      return [];
    }
  }

  /** Obtener libros desde Google Books API */
  static async obtenerLibrosGoogle(consulta, maxResults = 10) {
    try {
      const url = `${this.BASE_URL_GOOGLE}?q=${encodeURIComponent(consulta)}&maxResults=${maxResults}&orderBy=relevance&printType=books`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google Books API error! status: ${response.status}`);
      const data = await response.json();
      return this.procesarLibrosGoogle(data.items || []);
    } catch (error) {
      console.error('Error en Google Books API:', error);
      return [];
    }
  }

  /** Google paginado usando startIndex */
  static async obtenerLibrosGooglePaginado(consulta, page = 1, maxResults = 6) {
    const startIndex = (page - 1) * maxResults;
    try {
      const url = `${this.BASE_URL_GOOGLE}?q=${encodeURIComponent(consulta)}&maxResults=${maxResults}&startIndex=${startIndex}&orderBy=relevance&printType=books`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Google paginado error');
      const data = await res.json();
      return this.procesarLibrosGoogle(data.items || []);
    } catch (e) {
      console.error('Error Google paginado:', e);
      return [];
    }
  }

  /** Obtener libros desde Open Library */
  static async obtenerLibrosOpenLibrary(consulta, maxResults = 10) {
    try {
      const url = `${this.BASE_URL_OPENLIB}?q=${encodeURIComponent(consulta)}&limit=${maxResults}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open Library API error! status: ${response.status}`);
      const data = await response.json();
      return this.procesarLibrosOpenLibrary(data.docs || []);
    } catch (error) {
      console.error('Error en Open Library API:', error);
      return [];
    }
  }

  /** Open Library paginado (usa page) */
  static async obtenerLibrosOpenLibraryPaginado(consulta, page = 1, maxResults = 6) {
    try {
      const url = `${this.BASE_URL_OPENLIB}?q=${encodeURIComponent(consulta)}&page=${page}&limit=${maxResults}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('OpenLibrary paginado error');
      const data = await response.json();
      return this.procesarLibrosOpenLibrary(data.docs || []);
    } catch (e) {
      console.error('Error OpenLibrary paginado:', e);
      return [];
    }
  }

  /** Obtener libros desde ISBNdb (requiere API key en VITE_ISBNDB_KEY) */
  static async obtenerLibrosIsbnDb(consulta, maxResults = 10) {
    const apiKey = import.meta?.env?.VITE_ISBNDB_KEY;
    if (!apiKey) return [];
    try {
      const url = `${this.BASE_URL_ISBNDB}/${encodeURIComponent(consulta)}?page=1&pageSize=${maxResults}`;
      const response = await fetch(url, { headers: { 'Authorization': apiKey } });
      if (!response.ok) throw new Error(`ISBNdb API error! status: ${response.status}`);
      const data = await response.json();
      // Estructura esperada: data.books
      return this.procesarLibrosIsbnDb(data.books || []);
    } catch (error) {
      console.error('Error en ISBNdb API:', error);
      return [];
    }
  }

  /** ISBNdb paginado */
  static async obtenerLibrosIsbnDbPaginado(consulta, page = 1, maxResults = 6) {
    const apiKey = import.meta?.env?.VITE_ISBNDB_KEY;
    if (!apiKey) return [];
    try {
      const url = `${this.BASE_URL_ISBNDB}/${encodeURIComponent(consulta)}?page=${page}&pageSize=${maxResults}`;
      const response = await fetch(url, { headers: { 'Authorization': apiKey } });
      if (!response.ok) throw new Error('ISBNdb paginado error');
      const data = await response.json();
      return this.procesarLibrosIsbnDb(data.books || []);
    } catch (e) {
      console.error('Error ISBNdb paginado:', e);
      return [];
    }
  }

  /**
   * Obtener libros desde Open Library API
   */
  // OpenLibrary eliminado para simplificar (no requerido estrictamente)

  /** Procesar respuesta de Google Books */
  static procesarLibrosGoogle(libros) {
    const processed = libros
      .filter(libro => libro.volumeInfo?.title && libro.volumeInfo?.authors)
      .map(libro => {
        const info = libro.volumeInfo;
        const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '/placeholder-book.png';
        
        return {
          id: `google-${libro.id}`,
          title: info.title || 'Título no disponible',
          author: info.authors?.[0] || 'Autor desconocido',
          year: info.publishedDate ? new Date(info.publishedDate).getFullYear() : 'Año desconocido',
          description: info.description || 'Descripción no disponible',
          thumbnail: thumbnail.replace('http:', 'https:'),
          genre: info.categories?.[0] || 'General',
          isbn: info.industryIdentifiers?.[0]?.identifier || null,
          source: 'Google Books',
          rating: info.averageRating || null,
          pageCount: info.pageCount || null,
          language: info.language || 'es'
        };
      });
    
    // Guardar en caché automáticamente
    this._cacheBooks(processed);
    return processed;
  }

  /** Procesar respuesta de Open Library */
  static procesarLibrosOpenLibrary(libros) {
    const processed = libros
      .filter(doc => doc.title && (doc.author_name?.length))
      .map(doc => {
        const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '/placeholder-book.png';
        // Sanitize key: replace any '/' with double underscore to keep route one-segment
        const rawKey = doc.key || doc.cover_i || doc.title.replace(/\s+/g,'-');
        const safeKey = String(rawKey).replace(/\//g,'__');
        return {
          id: `openlib-${safeKey}`,
            title: doc.title || 'Título no disponible',
            author: doc.author_name?.[0] || 'Autor desconocido',
            year: doc.first_publish_year || 'Año desconocido',
            description: doc.subtitle || 'Sin descripción disponible',
            thumbnail: cover,
            genre: (doc.subject && doc.subject[0]) || 'General',
            isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
            source: 'Open Library',
            rating: null,
            pageCount: doc.number_of_pages_median || null,
            language: doc.language?.[0] || 'es'
        };
      });
    
    // Guardar en caché automáticamente
    this._cacheBooks(processed);
    return processed;
  }

  /** Procesar respuesta de ISBNdb */
  static procesarLibrosIsbnDb(libros) {
    const processed = libros
      .filter(b => b.title && (b.authors?.length))
      .map(b => ({
        id: `isbndb-${b.isbn13 || b.isbn10 || b.title.replace(/\s+/g,'-')}`,
        title: b.title || 'Título no disponible',
        author: b.authors?.[0] || 'Autor desconocido',
        year: b.date_published || 'Año desconocido',
        description: b.synopsys || b.overview || 'Sin descripción disponible',
        thumbnail: b.image || '/placeholder-book.png',
        genre: b.subject || 'General',
        isbn: b.isbn13 || b.isbn10 || null,
        source: 'ISBNdb',
        rating: null,
        pageCount: null,
        language: b.language || 'es'
      }));
    
    // Guardar en caché automáticamente
    this._cacheBooks(processed);
    return processed;
  }

  /** Mezclar y limitar resultados */
  static mezclarYLimitar(libros, limite) { return libros.slice(0, limite); }

  /** Eliminar libros duplicados basándose en título y autor */
  static eliminarDuplicados(libros) {
    const vistos = new Set();
    return libros.filter(libro => {
      const clave = `${libro.title.toLowerCase()}-${libro.author.toLowerCase()}`;
      if (vistos.has(clave)) {
        return false;
      }
      vistos.add(clave);
      return true;
    });
  }

  /**
   * Cargar en paralelo las fuentes Google, OpenLibrary e ISBNdb.
   * Uso de Promise.allSettled para tolerar fallas parciales.
   * @param {string} query término de búsqueda
   * @param {number} maxPorFuente límite intentado por cada API
   * @returns {Promise<Array<Array<Object>>>} Arrays de libros ya normalizados por fuente
   */
  static async _cargarFuentesParalelo(query, maxPorFuente) {
    const resultados = await Promise.allSettled([
      this.obtenerLibrosGoogle(query, maxPorFuente),
      this.obtenerLibrosOpenLibrary(query, maxPorFuente),
      this.obtenerLibrosIsbnDb(query, maxPorFuente)
    ]);
    return resultados.map(r => r.status === 'fulfilled' ? r.value : []);
  }

  /**
   * Combina resultados de múltiples fuentes, elimina duplicados y ordena.
   * Prioriza libros con imagen y luego orden alfabético por título.
   * @param {Array<Array<Object>>} listas Arrays de libros
   * @param {number} limite máximo de resultados a devolver
   * @returns {Array<Object>} lista combinada depurada
   */
  static _combinarYDepurar(listas, limite) {
    const combinados = listas.flat();
    const sinDuplicados = this.eliminarDuplicados(combinados);
    // Orden básico: priorizar los que tengan thumbnail luego por título
    sinDuplicados.sort((a,b) => {
      const at = a.thumbnail ? 0 : 1;
      const bt = b.thumbnail ? 0 : 1;
      if (at !== bt) return at - bt;
      return a.title.localeCompare(b.title);
    });
    return this.mezclarYLimitar(sinDuplicados, limite);
  }

  /**
   * Obtener un libro específico por ID - MEJORADO PARA TODAS LAS FUENTES
   */
  static async obtenerLibroPorId(id) {
    try {
      // 1. Revisar caché primero
      if (this._bookCache.has(id)) {
        console.log(`✅ Libro encontrado en caché: ${id}`);
        console.log(`📚 Cache actual:`, Array.from(this._bookCache.keys()));
        return this._bookCache.get(id);
      }
      
      console.log(`❌ Libro NO en caché: ${id}`);
      console.log(`📚 Cache actual:`, Array.from(this._bookCache.keys()).slice(0, 10));
      console.log(`🔍 Tipo de ID: ${id.split('-')[0]}, Resto: ${id.split('-').slice(1).join('-')}`);
      // 2. Libros de Google Books
      if (id.startsWith('google-')) {
        const googleId = id.replace('google-', '');
        const url = `${this.BASE_URL_GOOGLE}/${googleId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const book = this.procesarLibrosGoogle([data])[0];
        if (book) {
          this._bookCache.set(id, book); // Guardar en caché
        }
        return book;
      }
      
      // 2. Libros de Open Library (prefijo correcto: openlib-)
      if (id.startsWith('openlib-')) {
        console.log(`🔍 Procesando Open Library ID: ${id}`);
  const olKeySanitized = id.replace('openlib-', '');
  // Revert sanitization (double underscore back to slash) for real Open Library key
  const olKey = olKeySanitized.replace(/__/g,'/');
        console.log(`🔑 Clave extraída: ${olKey}`);
        
        try {
          // MÉTODO 1: Si es una clave de trabajo válida
          if (olKey.startsWith('/works/') || olKey.startsWith('OL')) {
            console.log(`📖 Intentando obtener trabajo específico...`);
            const workKey = olKey.startsWith('/works/') ? olKey.split('/works/')[1] : olKey;
            const url = `https://openlibrary.org/works/${workKey}.json`;
            const response = await fetch(url);
            if (response.ok) {
              const data = await response.json();
              const book = {
                id: id,
                title: data.title || 'Título no disponible',
                author: data.authors?.[0]?.name || 'Autor desconocido',
                description: data.description?.value || data.description || 'Descripción no disponible',
                year: data.first_publish_date || 'Año no disponible',
                thumbnail: data.covers?.[0] ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : '/placeholder-book.png',
                source: 'Open Library',
                genre: data.subjects?.[0] || 'Género no especificado',
                pageCount: null,
                isbn: null,
                language: 'es'
              };
              this._bookCache.set(id, book); // Guardar en caché
              console.log(`✅ Open Library libro encontrado:`, book.title);
              return book;
            }
          }
          
          // MÉTODO 2: Buscar por título como fallback
          console.log(`🔍 Buscando por título en Open Library: ${olKey}`);
          const searchTitle = olKey.replace(/-/g, ' '); // Convertir guiones a espacios
          const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchTitle)}&limit=1`;
          const searchResponse = await fetch(searchUrl);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (searchData.docs && searchData.docs.length > 0) {
              const doc = searchData.docs[0];
              const book = {
                id: id,
                title: doc.title || 'Título no disponible',
                author: doc.author_name?.[0] || 'Autor desconocido',
                description: doc.subtitle || 'Sin descripción disponible',
                year: doc.first_publish_year || 'Año desconocido',
                thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '/placeholder-book.png',
                source: 'Open Library (búsqueda)',
                genre: (doc.subject && doc.subject[0]) || 'General',
                pageCount: doc.number_of_pages_median || null,
                isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
                language: 'es'
              };
              this._bookCache.set(id, book); // Guardar en caché
              console.log(`✅ Open Library libro encontrado por búsqueda:`, book.title);
              return book;
            }
          }
        } catch (e) {
          console.error('❌ Error obteniendo detalles de Open Library:', e);
          // MÉTODO 3: Crear libro básico desde el ID como último recurso
          const fallbackBook = {
            id: id,
            title: olKey.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
            author: 'Autor no disponible',
            description: `Este libro proviene de Open Library pero no se pudo obtener información completa. ID: ${id}`,
            year: 'Año desconocido',
            thumbnail: '/placeholder-book.png',
            source: 'Open Library (fallback)',
            genre: 'General',
            pageCount: null,
            isbn: null,
            language: 'es'
          };
          this._bookCache.set(id, fallbackBook);
          console.log(`⚠️ Open Library fallback creado:`, fallbackBook.title);
          return fallbackBook;
        }
      }
      
      // 3. Libros de ISBNdb (prefijo correcto: isbndb-)
      if (id.startsWith('isbndb-')) {
        const isbn = id.replace('isbndb-', '');
        const apiKey = import.meta?.env?.VITE_ISBNDB_KEY;
        if (apiKey) {
          try {
            const url = `https://api2.isbndb.com/book/${isbn}`;
            const response = await fetch(url, { headers: { 'Authorization': apiKey } });
            if (response.ok) {
              const data = await response.json();
              const book = data.book;
              if (book) {
                return {
                  id: id,
                  title: book.title || 'Título no disponible',
                  author: book.authors?.[0] || 'Autor desconocido',
                  description: book.synopsis || 'Descripción no disponible',
                  year: book.date_published || 'Año no disponible',
                  thumbnail: book.image || '/placeholder-book.png',
                  source: 'ISBNdb',
                  genre: book.subjects?.[0] || 'Género no especificado',
                  pageCount: book.pages || null,
                  isbn: book.isbn || book.isbn13 || null,
                  language: book.language || 'es'
                };
              }
            }
          } catch (e) {
            console.warn('Error obteniendo detalles de ISBNdb:', e);
          }
        }
      }
      
      // 4. Fallback: búsqueda final fallida -> null
      console.warn(`ID no encontrado directamente: ${id}, intentando búsqueda por título...`);
      
      return null;
    } catch (error) {
      console.error('Error al obtener libro por ID:', error);
      return null;
    }
  }

}

export default BookService;