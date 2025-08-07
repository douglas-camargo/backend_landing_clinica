/**
 * Interfaz del repositorio de citas (Puerto)
 * Define los contratos que deben implementar los adaptadores
 */
class CitaRepository {
  async save(cita) {
    throw new Error('Método save debe ser implementado por el adaptador');
  }
}

module.exports = CitaRepository;
