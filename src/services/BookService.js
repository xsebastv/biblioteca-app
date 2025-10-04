/**
 * Servicio para obtener libros desde múltiples APIs públicas
 * - Google Books API
 * - Open Library API
 * - ISBNdb API (requiere API key: VITE_ISBNDB_KEY)
 * Unifica el modelo de datos y aplica deduplicación y fallback.
 */
class BookService {
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
    return libros
      .filter(libro => libro.volumeInfo?.title && libro.volumeInfo?.authors)
      .map(libro => {
        const info = libro.volumeInfo;
        const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '/api/placeholder/150/200';
        
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
  }

  /** Procesar respuesta de Open Library */
  static procesarLibrosOpenLibrary(libros) {
    return libros
      .filter(doc => doc.title && (doc.author_name?.length))
      .map(doc => {
        const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '/placeholder-book.png';
        return {
          id: `openlib-${doc.key || doc.cover_i || doc.title.replace(/\s+/g,'-')}`,
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
  }

  /** Procesar respuesta de ISBNdb */
  static procesarLibrosIsbnDb(libros) {
    return libros
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

  /** Cargar fuentes en paralelo de forma resiliente */
  static async _cargarFuentesParalelo(query, maxPorFuente) {
    const resultados = await Promise.allSettled([
      this.obtenerLibrosGoogle(query, maxPorFuente),
      this.obtenerLibrosOpenLibrary(query, maxPorFuente),
      this.obtenerLibrosIsbnDb(query, maxPorFuente)
    ]);
    return resultados.map(r => r.status === 'fulfilled' ? r.value : []);
  }

  /** Combinar, limpiar duplicados, ordenar y limitar */
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
   * Obtener un libro específico por ID
   */
  static async obtenerLibroPorId(id) {
    try {
      if (id.startsWith('google-')) {
        const googleId = id.replace('google-', '');
        const url = `${this.BASE_URL_GOOGLE}/${googleId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return this.procesarLibrosGoogle([data])[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error al obtener libro por ID:', error);
      return null;
    }
  }

  /**
   * Libros de respaldo en caso de falla de las APIs
   */
  static obtenerLibrosRespaldo() {
    const placeholder = '/placeholder-book.png';
    const truncate = (text, len = 180) => text.length > len ? text.slice(0, len - 3) + '...' : text;
    return [
      {
        id: 'backup-1',
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        year: '1967',
        description: truncate('Una obra maestra del realismo mágico que narra la historia de la familia Buendía a lo largo de varias generaciones.'),
        thumbnail: placeholder,
        genre: 'Realismo Mágico',
        source: 'Backup',
        rating: 4.5,
        pageCount: 417
      },
      {
        id: 'backup-2',
        title: 'Don Quijote de la Mancha',
        author: 'Miguel de Cervantes',
        year: '1605',
        description: truncate('La historia del ingenioso hidalgo que decide convertirse en caballero andante para revivir la caballería.'),
        thumbnail: placeholder,
        genre: 'Clásico',
        source: 'Backup',
        rating: 4.3,
        pageCount: 863
      },
      {
        id: 'backup-3',
        title: 'Rayuela',
        author: 'Julio Cortázar',
        year: '1963',
        description: truncate('Una novela experimental que puede leerse de múltiples formas, explorando temas existenciales y filosóficos.'),
        thumbnail: placeholder,
        genre: 'Literatura Experimental',
        source: 'Backup',
        rating: 4.2,
        pageCount: 736
      },
      {
        id: 'backup-4',
        title: 'La Casa de los Espíritus',
        author: 'Isabel Allende',
        year: '1982',
        description: truncate('Una saga familiar que abarca varias generaciones, mezclando elementos fantásticos con la realidad histórica.'),
        thumbnail: placeholder,
        genre: 'Realismo Mágico',
        source: 'Backup',
        rating: 4.4,
        pageCount: 433
      },
      {
        id: 'backup-5',
        title: 'El Túnel',
        author: 'Ernesto Sabato',
        year: '1948',
        description: truncate('Una novela psicológica que explora la obsesión y el aislamiento humano a través de la historia de Juan Pablo Castel.'),
        thumbnail: placeholder,
        genre: 'Novela Psicológica',
        source: 'Backup',
        rating: 4.1,
        pageCount: 157
      },
      {
        id: 'backup-6',
        title: 'Pedro Páramo',
        author: 'Juan Rulfo',
        year: '1955',
        description: truncate('Una obra fundamental de la literatura latinoamericana que narra la búsqueda de un hijo por su padre en un pueblo fantasmal.'),
        thumbnail: placeholder,
        genre: 'Realismo Mágico',
        source: 'Backup',
        rating: 4.3,
        pageCount: 124
      }
    ];
  }
}

export default BookService;