import BookService from '../services/BookService.js';

/**
 * Controlador simple para manejar libros
 * Solo incluye funcionalidades requeridas por el proyecto
 */
class BookController {
  /**
   * Obtener todos los libros para la página de inicio
   */
  static async getAllBooks() {
    try {
      return await BookService.obtenerLibrosPopulares();
    } catch (error) {
      console.error('Error en BookController.getAllBooks:', error);
      return BookService.obtenerLibrosRespaldo();
    }
  }
}

export default BookController;