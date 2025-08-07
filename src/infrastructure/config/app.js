require('dotenv').config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const { 
  helmet, 
  corsOptions, 
  generalRateLimit, 
  securityLogger, 
  securityHeaders,
  validateApiKey,
  generateToken
} = require('../middleware/security');

const { handleEncryptedCredentials } = require('../middleware/encryption');

// Importar adaptadores
const InMemoryCitaRepository = require('../adapters/database/InMemoryCitaRepository');
const NodemailerAdapter = require('../adapters/email/NodemailerAdapter');

// Importar rutas
const createCitaRoutes = require('../routes/citas');

// Validación de variables de entorno críticas
const validateEnvironment = () => {
  const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing.join(', '));
    console.error('Por favor, configura estas variables en config.env');
    process.exit(1);
  }
};

class App {
  constructor() {
    // Validar entorno antes de inicializar
    validateEnvironment();
    
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Middlewares de seguridad
    this.app.use(helmet);
    this.app.use(cors(corsOptions));
    this.app.use(generalRateLimit);
    this.app.use(securityLogger);
    this.app.use(securityHeaders);
    this.app.use(validateApiKey);

    // Middlewares de Express
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Middleware para obtener IP real
    this.app.use((req, res, next) => {
      const realIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);
      req.realIP = realIP;
      next();
    });
  }

  setupRoutes() {
    // Crear instancias de adaptadores
    const citaRepository = new InMemoryCitaRepository();
    const emailService = new NodemailerAdapter();

    // Rutas de la API
    this.app.use('/api/citas', createCitaRoutes(citaRepository, emailService));

    // Ruta de salud
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0'
      });
    });

    // Ruta para generar token (disponible en desarrollo y producción)
    this.app.post('/api/auth/token', handleEncryptedCredentials, (req, res) => {
      try {
        const { clientId, clientSecret } = req.body;
        
        // Validación de campos requeridos
        if (!clientId || !clientSecret) {
          return res.status(400).json({
            success: false,
            message: 'clientId y clientSecret son requeridos (pueden ser cifrados o sin cifrar)'
          });
        }

        // En producción, validar credenciales reales
        if (process.env.NODE_ENV === 'production') {
          const validCredentials = process.env.VALID_CLIENT_CREDENTIALS;
          if (validCredentials) {
            try {
              const credentials = JSON.parse(validCredentials);
              const isValid = credentials.some(cred => 
                cred.clientId === clientId && cred.clientSecret === clientSecret
              );
              
              if (!isValid) {
                return res.status(401).json({
                  success: false,
                  message: 'Credenciales inválidas'
                });
              }
            } catch (parseError) {
              console.error('Error al parsear VALID_CLIENT_CREDENTIALS:', parseError);
              return res.status(500).json({
                success: false,
                message: 'Error de configuración del servidor'
              });
            }
          }
        }

        // Generar token con información del cliente
        const token = generateToken({
          clientId,
          role: 'client',
          timestamp: new Date().toISOString()
        });

        res.status(200).json({
          success: true,
          message: 'Token generado exitosamente',
          data: {
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            type: 'Bearer',
            environment: process.env.NODE_ENV || 'development'
          }
        });
      } catch (error) {
        console.error('Error al generar token:', error);
        res.status(500).json({
          success: false,
          message: 'Error al generar token'
        });
      }
    });

    // Ruta de información de la API
    this.app.get('/api/info', (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          name: 'API Clínica Caracas',
          version: '2.0.0',
          description: 'API REST para gestión de citas médicas',
          architecture: 'Hexagonal Architecture',
          authentication: 'JWT Token Required',
          endpoints: {
            'POST /api/auth/token': 'Generar token de acceso',
            'POST /api/citas': 'Crear nueva cita (requiere token)',
            'GET /api/health': 'Verificar estado de la API'
          },
          services: [
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
          features: [
            'Autenticación JWT',
            'Envío de correos electrónicos',
            'Validación de datos',
            'Rate limiting',
            'CORS configurado',
            'Logging de seguridad'
          ]
        }
      });
    });

    // Ruta 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
      });
    });
  }

  setupErrorHandling() {
    // Middleware de manejo de errores global
    this.app.use((error, req, res, next) => {
      console.error('🚨 Error no manejado:', error);

      // Si es un error de validación de Joi o similar
      if (error.isJoi) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Si es un error de CORS
      if (error.message === 'No permitido por CORS') {
        return res.status(403).json({
          success: false,
          message: 'Acceso no permitido desde este origen'
        });
      }

      // Error genérico
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor iniciado en puerto ${this.port}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Clínica: ${process.env.CLINIC_NAME}`);
      console.log(`📧 Email: ${process.env.CLINIC_EMAIL}`);
      console.log(`🔗 API disponible en: http://localhost:${this.port}/api`);
      console.log(`💚 Health check: http://localhost:${this.port}/api/health`);
      console.log(`📋 Info API: http://localhost:${this.port}/api/info`);
    });
  }
}

module.exports = App;
