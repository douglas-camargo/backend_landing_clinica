#!/usr/bin/env node

/**
 * Script para validar variables de entorno según el ambiente
 * Uso: node scripts/validate-env.js [development|production]
 */

require('dotenv').config({ path: './config.env' });

const environment = process.argv[2] || process.env.NODE_ENV || 'development';

console.log(`🔍 Validando configuración para ambiente: ${environment}`);
console.log('=' .repeat(50));

// Variables requeridas para todos los ambientes
const requiredVars = [
  'EMAIL_USER',
  'EMAIL_PASS',
  'JWT_SECRET',
  'CLINIC_NAME',
  'CLINIC_EMAIL',
  'CLINIC_PHONE'
];

// Variables específicas para producción
const productionVars = [
  'VALID_CLIENT_CREDENTIALS',
  'ENCRYPTION_KEY'
];

// Variables opcionales
const optionalVars = [
  'API_KEYS',
  'LOG_LEVEL',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_GENERAL',
  'RATE_LIMIT_MAX_CITAS',
  'CORS_ALLOWED_ORIGINS'
];

let hasErrors = false;

// Validar variables requeridas
console.log('\n📋 Variables requeridas:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: FALTANTE`);
    hasErrors = true;
  } else {
    const maskedValue = varName.includes('PASS') || varName.includes('SECRET') || varName.includes('KEY') 
      ? '*'.repeat(Math.min(value.length, 8)) 
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

// Validar variables específicas de producción
if (environment === 'production') {
  console.log('\n🏭 Variables específicas de producción:');
  productionVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: FALTANTE (requerida en producción)`);
      hasErrors = true;
    } else {
      const maskedValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? '*'.repeat(Math.min(value.length, 8)) 
        : value;
      console.log(`✅ ${varName}: ${maskedValue}`);
    }
  });
}

// Mostrar variables opcionales
console.log('\n🔧 Variables opcionales:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: No configurada (usando valores por defecto)`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Validaciones específicas
console.log('\n🔒 Validaciones de seguridad:');

// Validar JWT_SECRET en producción
if (environment === 'production') {
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.log('❌ JWT_SECRET: Demasiado corto para producción (mínimo 32 caracteres)');
    hasErrors = true;
  } else if (jwtSecret && jwtSecret.includes('tu-super-secreto')) {
    console.log('❌ JWT_SECRET: Debes cambiar el valor por defecto en producción');
    hasErrors = true;
  } else {
    console.log('✅ JWT_SECRET: Configurado correctamente');
  }
}

// Validar credenciales de cliente en producción
if (environment === 'production') {
  const validCredentials = process.env.VALID_CLIENT_CREDENTIALS;
  if (validCredentials) {
    try {
      const credentials = JSON.parse(validCredentials);
      if (!Array.isArray(credentials) || credentials.length === 0) {
        console.log('❌ VALID_CLIENT_CREDENTIALS: Debe ser un array JSON no vacío');
        hasErrors = true;
      } else {
        console.log(`✅ VALID_CLIENT_CREDENTIALS: ${credentials.length} credenciales configuradas`);
      }
    } catch (error) {
      console.log('❌ VALID_CLIENT_CREDENTIALS: Formato JSON inválido');
      hasErrors = true;
    }
  }
}

// Validar configuración de email
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
if (emailUser && emailPass) {
  if (!emailUser.includes('@')) {
    console.log('❌ EMAIL_USER: Formato de email inválido');
    hasErrors = true;
  } else {
    console.log('✅ EMAIL_USER: Formato válido');
  }
  
  if (emailPass.length < 8) {
    console.log('❌ EMAIL_PASS: Contraseña demasiado corta');
    hasErrors = true;
  } else {
    console.log('✅ EMAIL_PASS: Longitud adecuada');
  }
}

// Validar configuración de CORS
const corsOrigins = process.env.CORS_ALLOWED_ORIGINS;
if (corsOrigins) {
  const origins = corsOrigins.split(',');
  if (environment === 'production') {
    const hasHttps = origins.some(origin => origin.startsWith('https://'));
    if (!hasHttps) {
      console.log('⚠️  CORS_ALLOWED_ORIGINS: En producción, se recomienda usar solo HTTPS');
    }
  }
  console.log(`✅ CORS_ALLOWED_ORIGINS: ${origins.length} orígenes configurados`);
}

// Resumen
console.log('\n' + '=' .repeat(50));
if (hasErrors) {
  console.log('❌ Configuración INCOMPLETA. Corrige los errores antes de continuar.');
  process.exit(1);
} else {
  console.log('✅ Configuración VÁLIDA para el ambiente:', environment);
  
  if (environment === 'production') {
    console.log('\n⚠️  RECORDATORIOS PARA PRODUCCIÓN:');
    console.log('- Asegúrate de cambiar todos los valores por defecto');
    console.log('- Usa HTTPS en todos los dominios');
    console.log('- Configura monitoreo y alertas');
    console.log('- Revisa los logs regularmente');
    console.log('- Haz backup de la configuración');
  }
}
