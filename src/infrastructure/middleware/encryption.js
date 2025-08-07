const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Validación de clave de encriptación
if (!ENCRYPTION_KEY) {
  console.warn('⚠️ ENCRYPTION_KEY no configurada. El cifrado de credenciales no estará disponible.');
}

const decrypt = (encryptedText) => {
  if (!ENCRYPTION_KEY) {
    throw new Error('Clave de encriptación no configurada');
  }
  
  if (!encryptedText?.trim()) {
    throw new Error('Texto cifrado inválido o vacío');
  }
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Resultado del descifrado está vacío');
    }
    return decrypted;
  } catch (error) {
    throw new Error(`Error al descifrar los datos: ${error.message}`);
  }
};

const decryptCredentials = (encryptedClientId, encryptedClientSecret) => {
  try {
    return {
      clientId: decrypt(encryptedClientId),
      clientSecret: decrypt(encryptedClientSecret)
    };
  } catch (error) {
    throw new Error(`Error al descifrar las credenciales: ${error.message}`);
  }
};

const handleEncryptedCredentials = (req, res, next) => {
  try {
    const { encryptedClientId, encryptedClientSecret } = req.body;
    
    // Solo procesar si ambas credenciales cifradas están presentes
    if (encryptedClientId && encryptedClientSecret) {
      if (!ENCRYPTION_KEY) {
        return res.status(400).json({
          success: false,
          message: 'Cifrado de credenciales no disponible en esta configuración'
        });
      }
      
      const { clientId, clientSecret } = decryptCredentials(encryptedClientId, encryptedClientSecret);
      
      // Reemplazar credenciales cifradas con las descifradas
      req.body.clientId = clientId;
      req.body.clientSecret = clientSecret;
      delete req.body.encryptedClientId;
      delete req.body.encryptedClientSecret;
    }
    
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Error al procesar credenciales cifradas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  decrypt,
  decryptCredentials,
  handleEncryptedCredentials,
  ENCRYPTION_KEY
};
