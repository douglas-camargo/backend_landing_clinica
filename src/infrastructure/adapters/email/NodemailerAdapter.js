const nodemailer = require('nodemailer');
const EmailService = require('../../../application/services/EmailService');

// Cache del mapa de servicios para evitar recrearlo en cada email
const SERVICIOS_MAP = {
  'consulta-general': 'Consulta General',
  'medicina-interna': 'Medicina Interna',
  'cardiologia': 'Cardiología',
  'dermatologia': 'Dermatología',
  'ginecologia': 'Ginecología',
  'pediatria': 'Pediatría',
  'ortopedia': 'Ortopedia',
  'neurologia': 'Neurología',
  'psicologia': 'Psicología',
  'nutricion': 'Nutrición',
  'laboratorio': 'Laboratorio',
  'radiologia': 'Radiología',
  'fisioterapia': 'Fisioterapia',
  'odontologia': 'Odontología',
  'oftalmologia': 'Oftalmología',
  'otorrinolaringologia': 'Otorrinolaringología',
  'urologia': 'Urología',
  'gastroenterologia': 'Gastroenterología',
  'endocrinologia': 'Endocrinología',
  'reumatologia': 'Reumatología'
};

// Configuración de fecha formateada
const FECHA_OPTIONS = {
  timeZone: 'America/Caracas',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

class NodemailerAdapter extends EmailService {
  constructor() {
    super();
    this.transporter = this.createTransporter();
    this.verifyConnection();
  }

  createTransporter() {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  verifyConnection() {
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Error al verificar el transportador de correo:', error);
      } else {
        console.log('✅ Servidor de correo listo para enviar mensajes');
      }
    });
  }

  // Método helper para obtener nombre del servicio
  getNombreServicio(service) {
    return SERVICIOS_MAP[service] || service;
  }

  // Método helper para formatear fecha
  formatearFecha(fechaCreacion) {
    return new Date(fechaCreacion).toLocaleString('es-ES', FECHA_OPTIONS);
  }

  async enviarEmailCita(cita) {
    const { id, name, email, phone, service, message, fechaCreacion } = cita;
    const nombreServicio = this.getNombreServicio(service);
    const fechaFormateada = this.formatearFecha(fechaCreacion);

    const mailOptions = {
      from: `"Sistema de Citas - ${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: process.env.CLINIC_EMAIL,
      cc: process.env.EMAIL_USER,
      subject: `Nueva Cita - ${nombreServicio} - ${name}`,
      html: this.generateEmailCitaHTML(id, name, email, phone, nombreServicio, message, fechaFormateada)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a la clínica para cita ${id}:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`❌ Error al enviar email a la clínica para cita ${id}:`, error);
      throw error;
    }
  }

  async enviarEmailConfirmacion(cita) {
    const { id, name, email, service, fechaCreacion } = cita;
    const nombreServicio = this.getNombreServicio(service);
    const fechaFormateada = this.formatearFecha(fechaCreacion);

    const mailOptions = {
      from: `"${process.env.CLINIC_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Cita - ${nombreServicio}`,
      html: this.generateEmailConfirmacionHTML(id, name, nombreServicio, fechaFormateada)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmación enviado a ${email} para cita ${id}:`, info.messageId);
      return info;
    } catch (error) {
      console.error(`❌ Error al enviar email de confirmación a ${email} para cita ${id}:`, error);
      throw error;
    }
  }

  generateEmailCitaHTML(id, name, email, phone, nombreServicio, message, fechaFormateada) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🏥 ${process.env.CLINIC_NAME}</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Nueva Solicitud de Cita</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">📋 Detalles de la Cita</h2>
            <p style="margin: 5px 0; color: #374151;"><strong>ID de Cita:</strong> ${id}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Fecha de Solicitud:</strong> ${fechaFormateada}</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Servicio:</strong> ${nombreServicio}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">👤 Información del Paciente</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p style="margin: 8px 0; color: #374151;"><strong>Teléfono:</strong> <a href="tel:${phone}" style="color: #2563eb;">${phone}</a></p>
          </div>
          
          ${message ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">💬 Mensaje del Paciente</h3>
            <p style="margin: 0; color: #78350f; line-height: 1.6;">${message}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Este mensaje fue enviado automáticamente desde el sistema de citas de ${process.env.CLINIC_NAME}
            </p>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
              Teléfono: ${process.env.CLINIC_PHONE} | Email: ${process.env.CLINIC_EMAIL}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  generateEmailConfirmacionHTML(id, name, nombreServicio, fechaFormateada) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 28px;">✅ Cita Confirmada</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">${process.env.CLINIC_NAME}</p>
          </div>
          
          <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">🎉 ¡Gracias por tu solicitud!</h2>
            <p style="margin: 0; color: #065f46; line-height: 1.6;">
              Hola <strong>${name}</strong>, hemos recibido tu solicitud de cita exitosamente. 
              Nuestro equipo médico revisará tu información y te contactaremos pronto.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📋 Detalles de tu Cita</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>ID de Cita:</strong> ${id}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Servicio:</strong> ${nombreServicio}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Fecha de Solicitud:</strong> ${fechaFormateada}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Estado:</strong> <span style="color: #f59e0b; font-weight: bold;">En Revisión</span></p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">⏰ Próximos Pasos</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li style="margin-bottom: 8px;">Nuestro equipo médico revisará tu solicitud</li>
              <li style="margin-bottom: 8px;">Te contactaremos en las próximas 24-48 horas</li>
              <li style="margin-bottom: 8px;">Confirmaremos la fecha y hora de tu cita</li>
              <li style="margin-bottom: 0;">Te enviaremos recordatorios antes de tu cita</li>
            </ul>
          </div>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📞 ¿Necesitas ayuda?</h3>
            <p style="margin: 0; color: #78350f; line-height: 1.6;">
              Si tienes alguna pregunta o necesitas modificar tu cita, no dudes en contactarnos:
            </p>
            <p style="margin: 10px 0 0 0; color: #78350f;">
              📞 <strong>Teléfono:</strong> <a href="tel:${process.env.CLINIC_PHONE}" style="color: #92400e;">${process.env.CLINIC_PHONE}</a><br>
              📧 <strong>Email:</strong> <a href="mailto:${process.env.CLINIC_EMAIL}" style="color: #92400e;">${process.env.CLINIC_EMAIL}</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Gracias por confiar en ${process.env.CLINIC_NAME} para tu cuidado médico
            </p>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
              Av. Francisco de Miranda, Torre Parque Cristal, Piso 15, Campo Alegre, Caracas
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

module.exports = NodemailerAdapter;
