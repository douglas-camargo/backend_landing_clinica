// Constantes de la aplicación
module.exports = {
  // Configuración del servidor
  SERVER: {
    DEFAULT_PORT: 3000,
    REQUEST_LIMIT: '1mb',
    GRACEFUL_SHUTDOWN_TIMEOUT: 1000
  },

  // Configuración de rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS_GENERAL: 100,
    MAX_REQUESTS_CITAS: 10
  },

  // Configuración de validación
  VALIDATION: {
    MAX_MESSAGE_LENGTH: 1000,
    MIN_NAME_LENGTH: 2,
    MIN_PHONE_LENGTH: 10
  },

  // Configuración de email
  EMAIL: {
    TIMEZONE: 'America/Caracas',
    LOCALE: 'es-ES'
  },

  // Configuración de seguridad
  SECURITY: {
    JWT_DEFAULT_EXPIRES_IN: '24h',
    ENCRYPTION_ALGORITHM: 'AES'
  },

  // Configuración de logging
  LOGGING: {
    MAX_USER_AGENT_LENGTH: 100,
    MAX_USER_AGENT_WARNING_LENGTH: 50
  },

  // Servicios médicos válidos
  SERVICIOS_MEDICOS: [
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
  ],

  // Mapeo de servicios a nombres legibles
  SERVICIOS_MAP: {
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
  },

  // Expresiones regulares compiladas
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[0-9\s\-\(\)]{10,}$/
  },

  // Configuración de CORS
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://landing-clinica-six.vercel.app'
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
    EXPOSED_HEADERS: ['X-Total-Count', 'X-Rate-Limit-Remaining']
  },

  // Variables de entorno requeridas
  REQUIRED_ENV_VARS: [
    'EMAIL_USER',
    'EMAIL_PASS',
    'JWT_SECRET'
  ],

  // Mensajes de error
  ERROR_MESSAGES: {
    MISSING_FIELDS: 'Campos requeridos faltantes',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    TOKEN_REQUIRED: 'Token de acceso requerido. Formato: Authorization: Bearer <token>',
    TOKEN_EXPIRED: 'Token expirado',
    TOKEN_INVALID: 'Token inválido',
    CORS_ERROR: 'No permitido por CORS',
    ENCRYPTION_NOT_AVAILABLE: 'Cifrado de credenciales no disponible en esta configuración',
    PAYLOAD_TOO_LARGE: 'Payload demasiado grande',
    INVALID_CONTENT_TYPE: 'Content-Type debe ser application/json',
    SERVER_ERROR: 'Error interno del servidor',
    CONFIGURATION_ERROR: 'Error de configuración del servidor'
  },

  // Mensajes de éxito
  SUCCESS_MESSAGES: {
    TOKEN_GENERATED: 'Token generado exitosamente',
    CITA_CREATED: 'Tu cita ha sido enviada exitosamente. Te hemos enviado un email de confirmación.',
    API_HEALTHY: 'API funcionando correctamente'
  }
};
