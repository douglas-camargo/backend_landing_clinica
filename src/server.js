const App = require('./infrastructure/config/app');

// Configuración de manejo de señales para cierre graceful
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} recibido, cerrando servidor...`);
  
  // Dar tiempo para que las conexiones activas se completen
  setTimeout(() => {
    console.log('✅ Servidor cerrado exitosamente');
    process.exit(0);
  }, 1000);
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('🚨 Error no capturado:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promesa rechazada no manejada:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

// Iniciar la aplicación
try {
  const app = new App();
  app.start();
} catch (error) {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
}
