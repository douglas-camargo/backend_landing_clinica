/**
 * Servicio de Email (Puerto)
 * Define los contratos para el envío de emails
 */
class EmailService {
  async enviarEmailCita(cita) {
    throw new Error('Método enviarEmailCita debe ser implementado por el adaptador');
  }

  async enviarEmailConfirmacion(cita) {
    throw new Error('Método enviarEmailConfirmacion debe ser implementado por el adaptador');
  }
}

module.exports = EmailService;
