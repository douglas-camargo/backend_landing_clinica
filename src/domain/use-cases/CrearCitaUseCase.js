const Cita = require('../entities/Cita');

class CrearCitaUseCase {
  constructor(citaRepository, emailService) {
    this.citaRepository = citaRepository;
    this.emailService = emailService;
  }

  async execute(datosCita) {
    try {
      // Crear la entidad Cita con validaciones
      const cita = Cita.create(datosCita);

      // Guardar la cita en el repositorio
      const citaGuardada = await this.citaRepository.save(cita);

      // Enviar emails en paralelo para mejor rendimiento
      const emailPromises = [
        this.emailService.enviarEmailCita(citaGuardada),
        this.emailService.enviarEmailConfirmacion(citaGuardada)
      ];

      // Esperar a que ambos emails se envíen
      await Promise.allSettled(emailPromises);

      return {
        success: true,
        message: 'Tu cita ha sido enviada exitosamente. Te hemos enviado un email de confirmación.',
        citaId: citaGuardada.id
      };

    } catch (error) {
      console.error('Error en CrearCitaUseCase.execute:', error);
      return {
        success: false,
        message: error.message || 'Error al crear la cita'
      };
    }
  }
}

module.exports = CrearCitaUseCase;
