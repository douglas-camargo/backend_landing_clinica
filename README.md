# API Backend - Clínica Caracas

## 🔌 APIs

### POST `/api/auth/token`
**Generar token de acceso**

```bash
curl -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"clientId": "app-web", "clientSecret": "secreto-123"}'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h"
  }
}
```

### POST `/api/citas`
**Crear cita médica** (requiere token)

```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com", 
    "phone": "+58 412 123-4567",
    "service": "consulta-general",
    "message": "Necesito consulta"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Cita enviada exitosamente",
  "citaId": "CITA-1234567890-abc123def"
}
```

### GET `/api/health`
**Verificar estado de la API**

```bash
curl http://localhost:3000/api/health
```

**Respuesta:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "version": "2.0.0"
}
```

### GET `/api/info`
**Información de la API**

```bash
curl http://localhost:3000/api/info
```

## 📝 Servicios Médicos

`consulta-general`, `medicina-interna`, `cardiologia`, `dermatologia`, `ginecologia`, `pediatria`, `ortopedia`, `neurologia`, `psicologia`, `nutricion`, `laboratorio`, `radiologia`, `fisioterapia`, `odontologia`, `oftalmologia`, `otorrinolaringologia`, `urologia`, `gastroenterologia`, `endocrinologia`, `reumatologia`

## 🔐 Autenticación

**JWT Token requerido** para endpoints protegidos.

```bash
Authorization: Bearer <token>
```

