# FTSC Backend - Sistema de Autenticación

## 🚀 Configuración Inicial

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/frutos-secos

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-aqui

# Server
PORT=3000
```

### 2. Instalar Dependencias
```bash
yarn install
```

### 3. Ejecutar la Aplicación
```bash
# Desarrollo
yarn start:dev

# Producción
yarn start:prod
```

## 📡 Endpoints de Autenticación

### POST /auth/register
Registrar un nuevo usuario

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123",
  "name": "Nombre Usuario"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-aqui",
  "user": {
    "id": "user-id",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "role": "user"
  }
}
```

### POST /auth/login
Iniciar sesión

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-aqui",
  "user": {
    "id": "user-id",
    "email": "usuario@ejemplo.com",
    "name": "Nombre Usuario",
    "role": "user"
  }
}
```

### GET /auth/profile
Obtener perfil del usuario autenticado

**Headers:**
```
Authorization: Bearer jwt-token-aqui
```

**Response:**
```json
{
  "userId": "user-id",
  "email": "usuario@ejemplo.com",
  "role": "user"
}
```

## 🔧 Tecnologías Utilizadas

- **NestJS** - Framework de Node.js
- **MongoDB** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación con tokens
- **Passport** - Estrategias de autenticación
- **bcryptjs** - Hash de contraseñas
- **class-validator** - Validación de DTOs

## 📁 Estructura del Proyecto

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/
│   ├── schemas/
│   │   └── user.schema.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts
└── main.ts
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- JWT tokens con expiración de 24 horas
- Validación de datos con class-validator
- CORS habilitado
- Whitelist de propiedades en DTOs

## 🧪 Próximos Pasos

1. Agregar roles y permisos
2. Implementar refresh tokens
3. Agregar rate limiting
4. Configurar Swagger para documentación
5. Agregar tests unitarios y e2e
