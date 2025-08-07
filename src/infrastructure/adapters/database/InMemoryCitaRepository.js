const CitaRepository = require('../../../domain/repositories/CitaRepository');

class InMemoryCitaRepository extends CitaRepository {
  constructor() {
    super();
    this.citas = new Map();
  }

  async save(cita) {
    try {
      if (!cita || !cita.id) {
        throw new Error('Cita inválida: ID requerido');
      }
      
      this.citas.set(cita.id, cita.toJSON());
      return cita;
    } catch (error) {
      console.error('Error al guardar cita en memoria:', error);
      throw new Error(`Error al guardar la cita: ${error.message}`);
    }
  }

  // Método adicional para obtener todas las citas (útil para debugging)
  async getAll() {
    return Array.from(this.citas.values());
  }

  // Método adicional para obtener una cita por ID
  async getById(id) {
    return this.citas.get(id) || null;
  }

  // Método adicional para limpiar el repositorio (útil para testing)
  async clear() {
    this.citas.clear();
  }
}

module.exports = InMemoryCitaRepository;
