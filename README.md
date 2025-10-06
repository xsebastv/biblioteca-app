# 📚 Biblioteca Digital Multifuente

## 🎓 Información del Proyecto Académico

**Proyecto:** Parcial 2 - Biblioteca Digital  
**Fecha:** 6 de Octubre de 2025  
**Asignación:** Examen Parcial 2

### Autores
- Juan Sebastian Rios Altamirano (95806)
- Jhonatan David Velasco Lopez (98251)

### Enlaces del Proyecto
- [Repositorio GitHub](https://github.com/xsebastv/biblioteca-app)
- [Demo en Vercel](https://biblioteca-app-xsebastv.vercel.app)

## 📋 Evaluación de Requisitos

## � Información del Proyecto

### Autores
- Juan Sebastian Rios Altamirano (95806)
- Jhonatan David Velasco Lopez (98251)

### Fecha de Entrega
6 de Octubre de 2025

## 📋 Requisitos Cumplidos

### 1. Página de Inicio (1.0 pts) ✅
- ✓ Vista de bienvenida con diseño atractivo y moderno
- ✓ Lista de libros con visualización en tarjetas
- ✓ Información completa de cada libro:
  - Título
  - Autor
  - Año de publicación
  - Descripción
  - Imagen de portada
- ✓ Integración con múltiples APIs:
  - Google Books API
  - Open Library API
  - ISBNdb API

### 2. Funcionalidad de Favoritos (1.0 pts) ✅
- ✓ Agregar libros a favoritos con un clic
- ✓ Vista dedicada de favoritos
- ✓ Ordenamiento por:
  - Fecha de agregado
  - Título (A-Z/Z-A)
- ✓ Interfaz intuitiva y responsiva

### 3. Eliminación de Favoritos (1.5 pts) ✅
- ✓ Botón de eliminación en cada libro
- ✓ Sistema de "Deshacer" eliminación (5 segundos)
- ✓ Confirmación visual de acciones
- ✓ Actualización instantánea de la interfaz

### 4. Almacenamiento de Datos (1.5 pts) ✅
- ✓ Persistencia completa en localStorage
- ✓ Estructura de datos optimizada
- ✓ Manejo de eventos para sincronización
- ✓ Sistema robusto de caché

## 🌟 Características Adicionales

### Internacionalización
- Soporte completo para español e inglés
- Persistencia de preferencias de idioma
- Traducciones contextuales en toda la aplicación

### Características Técnicas
- Construido con React + Vite para máximo rendimiento
- Sistema modular de componentes
- Gestión de estado optimizada
- Arquitectura por servicios y controladores
- Manejo robusto de errores y estados de carga

## 📁 Estructura del Proyectogital Multifuente

Aplicación React moderna que integra múltiples APIs de libros para crear una experiencia de búsqueda unificada y personalizada.

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

## 🗂️ Estructura del Proyecto
```
src/
  ├── App.jsx            # Componente principal
  ├── main.jsx          # Punto de entrada
  │
  ├── components/       # Componentes reutilizables
  │   ├── BookCard     # Tarjeta de libro
  │   ├── Footer       # Pie de página
  │   ├── Header       # Encabezado
  │   ├── LandingPage  # Página de bienvenida
  │   ├── Modal        # Modal reutilizable
  │   └── Navigation   # Navegación principal
  │
  ├── controllers/     # Lógica de control
  │   └── BookController.js
  │
  ├── hooks/          # Hooks personalizados
  │   └── useIntersectionFadeIn.js
  │
  ├── i18n/           # Internacionalización
  │   └── translations.js
  │
  ├── routes/         # Enrutamiento
  │   └── AppRoutes.jsx
  │
  ├── services/       # Servicios y APIs
  │   ├── ApiService.js    # Configuración base
  │   ├── BookService.js   # Gestión de libros
  │   └── FavoriteService.js # Gestión favoritos
  │
  └── views/          # Vistas principales
      ├── BookDetailView   # Detalle de libro
      ├── FavoritesView   # Lista de favoritos
      └── HomeView        # Página principal
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

## Posibles Extensiones Futuras
- Cache por query para reducir repeticiones de fetch.
- Prefetch anticipado de la siguiente página durante inactividad.
- Badges de idioma / rating visual.
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
Uso académico


