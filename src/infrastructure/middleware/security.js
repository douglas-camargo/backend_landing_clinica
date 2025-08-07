const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Configuración de rate limiting optimizada
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Demasiadas solicitudes desde esta IP') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.realIP || req.ip,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Rate limit específico para citas (más restrictivo)
const citasRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  10, // máximo 10 solicitudes por IP
  'Demasiadas solicitudes de citas. Por favor, espera antes de intentar nuevamente.'
);

// Rate limit para endpoints generales
const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutos
  100, // máximo 100 solicitudes por IP
  'Demasiadas solicitudes. Por favor, espera antes de intentar nuevamente.'
);

// Configuración de CORS mejorada
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'https://clinicaencaracas.com',
      'https://www.clinicaencaracas.com'
    ];
    
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
};

// Middleware de validación de entrada optimizado
const validateInput = (req, res, next) => {
  // Sanitizar y validar headers
  const contentType = req.get('Content-Type');
  if (req.method === 'POST' && (!contentType || !contentType.includes('application/json'))) {
    return res.status(400).json({
      success: false,
      message: 'Content-Type debe ser application/json'
    });
  }

  // Validar tamaño del body
  const contentLength = parseInt(req.get('Content-Length') || '0');
  if (contentLength > 1024 * 1024) { // 1MB máximo
    return res.status(413).json({
      success: false,
      message: 'Payload demasiado grande'
    });
  }

  next();
};

// Middleware de logging de seguridad optimizado
const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.realIP || req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100), // Limitar longitud del User-Agent
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0
    };

    // Log optimizado: solo mostrar información relevante
    if (res.statusCode >= 400) {
      console.warn('🚨 Security Warning:', {
        ...logData,
        userAgent: logData.userAgent?.substring(0, 50) // Acortar User-Agent en warnings
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📝 Access Log:', logData);
    }
  });

  next();
};

// Middleware de headers de seguridad adicionales
const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Middleware de validación de API key (opcional)
const validateApiKey = (req, res, next) => {
  const apiKey = req.get('X-API-Key');
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
  
  // Si no hay API keys configuradas, permitir acceso
  if (validApiKeys.length === 0) {
    return next();
  }
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      message: 'API key inválida o faltante'
    });
  }
  
  next();
};

// Middleware de autenticación por token JWT optimizado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido. Formato: Authorization: Bearer <token>'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET no configurado en variables de entorno');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    } else {
      console.error('❌ Error al verificar token:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

// Función para generar tokens (útil para testing o endpoints de login)
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
};

module.exports = {
  citasRateLimit,
  generalRateLimit,
  corsOptions,
  validateInput,
  securityLogger,
  securityHeaders,
  validateApiKey,
  authenticateToken,
  generateToken,
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
};
