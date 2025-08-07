const CrearCitaUseCase = require('../../domain/use-cases/CrearCitaUseCase');

class CitaController {
  constructor(citaRepository, emailService) {
    this.crearCitaUseCase = new CrearCitaUseCase(citaRepository, emailService);
  }

  async crearCita(req, res) {
    try {
      const { name, email, phone, service, message } = req.body;

      // Validación básica de campos requeridos
      const requiredFields = ['name', 'email', 'phone', 'service'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        });
      }

      // Validación adicional de tipos
      if (typeof name !== 'string' || typeof email !== 'string' || 
          typeof phone !== 'string' || typeof service !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos deben ser cadenas de texto'
        });
      }

      const resultado = await this.crearCitaUseCase.execute({
        name,
        email,
        phone,
        service,
        message
      });

      if (resultado.success) {
        return res.status(201).json(resultado);
      } else {
        return res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en CitaController.crearCita:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = CitaController;
