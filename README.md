# 📚 Biblioteca Digital Multifuente

Aplicación React + Vite que integra múltiples APIs públicas de libros (Google Books, Open Library e ISBNdb) con búsqueda, scroll infinito, favoritos persistentes, deshacer eliminaciones y combinación/deduplicación inteligente de resultados.

## ✨ Features Principales
- Búsqueda simultánea en 3 fuentes (Google, Open Library, ISBNdb*)
- Scroll infinito (IntersectionObserver) con carga incremental paginada
- Unificación y normalización del modelo de libro (id, título, autor, año, género, páginas, ISBN, fuente)
- Deduplicación por (título + autor)
- Favoritos persistentes en `localStorage` (servicio dedicado `FavoriteService`)
- Eliminación con modal de confirmación + Snackbar de “Deshacer” (5 seg)
- Resaltado visual de libros que ya son favoritos
- Fallback de libros locales en caso de fallo de todas las APIs
- Código desacoplado (Service + Controller + Views)

> *ISBNdb requiere key en `VITE_ISBNDB_KEY` (opcional). Si no está presente, simplemente se omiten sus resultados sin romper la app.

## 🗂️ Estructura Relevante
```
src/
  services/
    BookService.js        # Orquesta las APIs, normaliza, pagina y deduplica
    FavoriteService.js    # CRUD + deduplicación de favoritos en localStorage
  controllers/
    BookController.js     # Capa simple de orquestación hacia la vista
  views/
    HomeView.jsx          # Búsqueda, listado, infinite scroll, modal, undo
    FavoritesView.jsx     # Lista limpia de favoritos persistidos
  components/
    Modal.jsx             # Re-utilizable para confirmaciones
    Header.jsx / Navigation.jsx
```

## 🔌 Flujo de Datos
1. `HomeView` solicita libros iniciales (populares → query “programming”).
2. El usuario busca → `BookService.obtenerPaginaLibros(query, page, size)` agrega resultados combinados.
3. Scroll cercano al final dispara nueva página (IntersectionObserver → `loadNextPage`).
4. Favoritos se gestionan vía `FavoriteService` (agregar / remover / undo temporal).
5. El snackbar “Deshacer” repone el libro eliminado si se pulsa dentro del timeout.

## 🧠 Lógica de Paginación
- Cada “página virtual” combina porciones de cada API.
- Tamaño por API ≈ `pageSize / 3` (mínimo 3) para diversidad.
- Se arma una lista acumulada, se deduplica y luego se recorta la ventana `(page-1)*pageSize → page*pageSize`.

## 🧹 Deduplicación
- Clave: `title.toLowerCase() + '-' + author.toLowerCase()`.
- Se priorizan libros con imagen al ordenar.

## ♻️ Undo Eliminación
- Al confirmar eliminación se guarda `{book, timeoutId}`.
- Snackbar permite restaurar mientras el timeout (5s) no expira.

## 🚀 Scripts
```bash
npm install       # Instalar dependencias
npm run dev       # Modo desarrollo (Vite)
npm run build     # Build producción
npm run preview   # Servir build
```

## 🔐 Variables de Entorno
Crear `.env` (o `.env.local`):
```
VITE_ISBNDB_KEY=TU_API_KEY_ISBNDB
```
Si se omite, simplemente no se incluirá esa fuente.

## 🧪 Posibles Extensiones Futuras
- Cache por query para reducir repeticiones de fetch.
- Prefetch anticipado de la siguiente página durante inactividad.
- Badges de idioma / rating visual.
- Tests unitarios (services y deduplicación).
- Accesibilidad mejorada (roles ARIA adicionales y focus management del modal).

## 🛡️ Manejo de Errores
- Cada fetch se ejecuta con `Promise.allSettled` para aislar caídas.
- Fallback local si todas las fuentes fallan al cargar populares.

## 🖼️ UI
- CSS modular simple (sin frameworks pesados).
- `favorite-active` aplica estilo diferenciador.
- Snackbar manual (sin librerías externas) en capa superior (`position: fixed`).

## 📦 Modelo Normalizado de Libro
```js
{
  id: 'google-abc123',
  title: 'Título',
  author: 'Autor',
  year: '2024',
  description: '...',
  thumbnail: 'https://...',
  genre: 'General',
  isbn: '978...',
  source: 'Google Books' | 'Open Library' | 'ISBNdb' | 'Backup',
  rating: null | Number,
  pageCount: Number | null,
  language: 'es' | 'en' | ...
}
```

## ✅ Diferencias vs Versión Académica Minimal Anterior
| Aspecto | Antes | Ahora |
|---------|-------|-------|
| APIs | Solo Google + backup | Google + Open Library + ISBNdb (+ backup) |
| Búsqueda | Limitada / básica | Multi-fuente unificada |
| Paginación | Estática | Scroll infinito |
| Favoritos | Agregar / remover | Agregar / remover + undo |
| Modelo | Campos básicos | Metadatos expandidos (ISBN, páginas, fuente, etc.) |
| Robustez | Dependiente de 1 API | Resiliente (allSettled + fallback) |

## 📄 Licencia
Uso académico / demostrativo.

---
Si necesitas revertir a la versión minimal o agregar tests, pídelo y lo ajusto.
