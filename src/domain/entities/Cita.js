// Constantes para servicios válidos
const SERVICIOS_VALIDOS = [
  'consulta-general',
  'medicina-interna',
  'cardiologia',
  'dermatologia',
  'ginecologia',
  'pediatria',
  'ortopedia',
  'neurologia',
  'psicologia',
  'nutricion',
  'laboratorio',
  'radiologia',
  'fisioterapia',
  'odontologia',
  'oftalmologia',
  'otorrinolaringologia',
  'urologia',
  'gastroenterologia',
  'endocrinologia',
  'reumatologia'
];

// Expresiones regulares compiladas para mejor rendimiento
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\+]?[0-9\s\-\(\)]{10,}$/;

class Cita {
  constructor(id, name, email, phone, service, message, fechaCreacion, status = 'pendiente') {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.service = service;
    this.message = message || '';
    this.fechaCreacion = fechaCreacion;
    this.status = status;
    
    this.validate();
  }

  validate() {
    if (!this.id || typeof this.id !== 'string') {
      throw new Error('ID de cita es requerido y debe ser una cadena');
    }
    
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length < 2) {
      throw new Error('Nombre es requerido y debe tener al menos 2 caracteres');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Email es requerido y debe tener un formato válido');
    }
    
    if (!this.phone || !this.isValidPhone(this.phone)) {
      throw new Error('Teléfono es requerido y debe tener al menos 10 dígitos');
    }
    
    if (!this.service || !this.isValidService(this.service)) {
      throw new Error('Servicio es requerido y debe ser válido');
    }
    
    if (this.message && this.message.length > 1000) {
      throw new Error('Mensaje no puede exceder 1000 caracteres');
    }
    
    if (!this.fechaCreacion || !(this.fechaCreacion instanceof Date)) {
      throw new Error('Fecha de creación es requerida y debe ser una fecha válida');
    }
  }

  isValidEmail(email) {
    return EMAIL_REGEX.test(email);
  }

  isValidPhone(phone) {
    return PHONE_REGEX.test(phone);
  }

  isValidService(service) {
    return SERVICIOS_VALIDOS.includes(service);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      service: this.service,
      message: this.message,
      fechaCreacion: this.fechaCreacion.toISOString(),
      status: this.status
    };
  }

  static create(datosCita) {
    const id = datosCita.id || `CITA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fechaCreacion = datosCita.fechaCreacion ? new Date(datosCita.fechaCreacion) : new Date();
    
    return new Cita(
      id,
      datosCita.name.trim(),
      datosCita.email.trim().toLowerCase(),
      datosCita.phone.trim(),
      datosCita.service,
      datosCita.message ? datosCita.message.trim() : '',
      fechaCreacion,
      datosCita.status || 'pendiente'
    );
  }

  // Método estático para obtener servicios válidos
  static getServiciosValidos() {
    return [...SERVICIOS_VALIDOS];
  }
}

module.exports = Cita;
