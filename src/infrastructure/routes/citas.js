const express = require('express');
const router = express.Router();
const CitaController = require('../controllers/CitaController');
const { citasRateLimit, validateInput, authenticateToken } = require('../middleware/security');
const { handleEncryptedCredentials } = require('../middleware/encryption');

// Middleware para inyectar dependencias
const createCitaRoutes = (citaRepository, emailService) => {
  const citaController = new CitaController(citaRepository, emailService);

  // POST /api/citas - Crear nueva cita
  router.post('/', 
    authenticateToken,
    citasRateLimit,
    handleEncryptedCredentials,
    validateInput,
    citaController.crearCita.bind(citaController)
  );

  return router;
};

module.exports = createCitaRoutes;
