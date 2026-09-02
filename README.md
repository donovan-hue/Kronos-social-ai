# Kronos Social AI

Plataforma web de red social con funcionalidades de inteligencia artificial.

El proyecto está dividido en:

* `client/` — Frontend React + Vite
* `server/` — Backend Node.js + Express + Socket.IO
* `guardian/` — Módulo auxiliar para análisis/control del proyecto
* `docs/` — Documentación técnica

## Requisitos

Antes de iniciar el proyecto necesitas:

* Node.js 20.x
* npm
* MongoDB
* Una terminal compatible con los comandos de npm

Las funcionalidades de IA requieren las claves correspondientes de OpenAI y/o Google Gemini.

---

# 1. Instalación

Clona el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd Kronos-social-ai
```

Instala todas las dependencias desde la raíz:

```bash
npm install
```

El proyecto utiliza npm workspaces para administrar `client/` y `server/`.

---

# 2. Configuración del backend

Entra al directorio del servidor:

```bash
cd server
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edita `server/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/kronos_social_ai

JWT_SECRET=cambia_esta_clave_por_una_clave_segura_y_larga

OPENAI_API_KEY=

GEMINI_API_KEY=

CLIENT_URL=http://localhost:3000
```

## Variables de entorno

| Variable         | Obligatoria         | Descripción                                                      |
| ---------------- | ------------------- | ---------------------------------------------------------------- |
| `PORT`           | No                  | Puerto del backend. Por defecto `5000`.                          |
| `NODE_ENV`       | No                  | Entorno de ejecución.                                            |
| `MONGODB_URI`    | Sí                  | Cadena de conexión a MongoDB.                                    |
| `JWT_SECRET`     | Sí                  | Clave utilizada para firmar los tokens JWT.                      |
| `OPENAI_API_KEY` | Según funcionalidad | API key de OpenAI para las funciones que utilicen OpenAI.        |
| `GEMINI_API_KEY` | Según funcionalidad | API key de Google Gemini para las funciones que utilicen Gemini. |
| `CLIENT_URL`     | No                  | Origen permitido para el frontend.                               |

### Importante

No subas nunca el archivo `.env` a GitHub.

Las claves privadas deben mantenerse únicamente en variables de entorno.

---

# 3. Iniciar el backend

Desde la raíz del proyecto:

```bash
npm run server
```

O directamente:

```bash
cd server
npm run dev
```

El servidor estará disponible normalmente en:

```text
http://localhost:5000
```

Para ejecutar el servidor en modo producción:

```bash
npm run start
```

---

# 4. Iniciar el frontend

Desde la raíz del proyecto:

```bash
npm run client
```

O directamente:

```bash
cd client
npm run dev
```

Vite utilizará:

```text
http://localhost:3000
```

El frontend utiliza:

```env
VITE_API_URL
```

Si esta variable no existe, actualmente utiliza por defecto:

```text
http://localhost:5000/api
```

Para configurar una URL diferente, crea `client/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

No coloques secretos privados en variables `VITE_*`, porque estas variables terminan expuestas en el frontend.

---

# 5. Ejecutar frontend y backend simultáneamente

Desde la raíz:

```bash
npm run dev
```

Este comando inicia:

* Backend → `http://localhost:5000`
* Frontend → `http://localhost:3000`

---

# 6. Health check

El backend dispone de:

```http
GET /health
```

Ejemplo:

```bash
curl http://localhost:5000/health
```

Respuesta esperada:

```json
{
  "ok": true,
  "service": "kronos-social-ai"
}
```

Este endpoint permite comprobar rápidamente que el servidor HTTP está funcionando.

---

# 7. Autenticación

Los endpoints de autenticación están bajo:

```text
/api/auth
```

### Registro

```http
POST /api/auth/register
```

Ejemplo:

```json
{
  "username": "usuario",
  "email": "usuario@example.com",
  "password": "password123",
  "displayName": "Usuario"
}
```

### Login

```http
POST /api/auth/login
```

Ejemplo:

```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

El login devuelve un JWT.

Los endpoints protegidos utilizan:

```http
Authorization: Bearer <TOKEN>
```

---

# 8. API de publicaciones

Las publicaciones están disponibles bajo:

```text
/api/posts
```

### Listar publicaciones

```http
GET /api/posts
```

Este endpoint requiere autenticación.

Actualmente devuelve:

```json
{
  "posts": []
}
```

Las publicaciones incluyen información del autor mediante `populate`:

* `username`
* `displayName`
* `avatar`

También se incluyen comentarios y sus usuarios.

### Crear publicación

```http
POST /api/posts
```

Body actual:

```json
{
  "content": "Mi primera publicación"
}
```

Requiere autenticación.

### Like

```http
POST /api/posts/:postId/like
```

Requiere autenticación.

### Comentario

```http
POST /api/posts/:postId/comments
```

Body:

```json
{
  "content": "Excelente publicación"
}
```

Requiere autenticación.

---

# 9. API de usuarios

Los endpoints de usuarios están bajo:

```text
/api/users
```

Las rutas disponibles pueden consultarse directamente en:

```text
server/src/modules/users/users.routes.js
```

---

# 10. API de mensajes

Los mensajes utilizan:

```text
/api/messages
```

El sistema también utiliza Socket.IO para comunicación en tiempo real.

El backend acepta autenticación del socket mediante el evento:

```text
authenticate
```

con el JWT del usuario.

---

# 11. Funciones de inteligencia artificial

## Generación de imágenes

```http
POST /api/ai/images/generate
```

Body:

```json
{
  "prompt": "Una ciudad futurista de noche"
}
```

Requiere autenticación.

También existe subida de imágenes:

```http
POST /api/ai/images/upload
```

## Generación de vídeo

```http
POST /api/ai/videos/generate
```

Body:

```json
{
  "prompt": "Una escena cinematográfica futurista"
}
```

Historial:

```http
GET /api/ai/videos/history
```

Obtener una generación:

```http
GET /api/ai/videos/:id
```

Eliminar una generación:

```http
DELETE /api/ai/videos/:id
```

## Generación de scripts

```http
POST /api/ai/scripts/generate
```

Ejemplo:

```json
{
  "prompt": "Escribe un guion corto para un vídeo tecnológico",
  "type": "custom"
}
```

Historial:

```http
GET /api/ai/scripts/history
```

Obtener un script:

```http
GET /api/ai/scripts/:id
```

Eliminar un script:

```http
DELETE /api/ai/scripts/:id
```

---

# 12. Estructura principal

```text
Kronos-social-ai/
│
├── client/
│   ├── src/
│   │   ├── features/
│   │   │   ├── ai/
│   │   │   ├── auth/
│   │   │   ├── image-ai/
│   │   │   ├── script-ai/
│   │   │   ├── social/
│   │   │   ├── users/
│   │   │   └── video-ai/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── ai-core/
│   │   │   ├── auth/
│   │   │   ├── image-ai/
│   │   │   ├── messages/
│   │   │   ├── posts/
│   │   │   ├── script-ai/
│   │   │   ├── users/
│   │   │   └── video-ai/
│   │   └── server.js
│   ├── test/
│   ├── .env.example
│   └── package.json
│
├── guardian/
├── docs/
├── scripts/
├── package.json
└── README.md
```

---

# 13. Scripts disponibles

Desde la raíz:

### Desarrollo completo

```bash
npm run dev
```

### Solo frontend

```bash
npm run client
```

### Solo backend

```bash
npm run server
```

### Build del frontend

```bash
npm run build
```

### Producción del backend

```bash
npm run start
```

### Tests del backend

```bash
npm test --workspace=server
```

---

# 14. Verificación rápida después de instalar

Primero comprueba MongoDB.

Después:

```bash
npm install
```

Configura:

```text
server/.env
```

Inicia el proyecto:

```bash
npm run dev
```

Comprueba:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:5000

Health:
http://localhost:5000/health
```

Si `/health` devuelve:

```json
{
  "ok": true,
  "service": "kronos-social-ai"
}
```

el servidor HTTP está funcionando correctamente.

---

# 15. Flujo recomendado de desarrollo

Para evitar acumular errores, las funcionalidades se implementarán de forma incremental:

1. Documentación base
2. Feed social
3. API de publicaciones
4. Creación de publicaciones
5. Storage multimedia
6. Socket.IO y mensajería
7. Historial multimedia IA
8. Tests
9. CI/CD
10. Docker
11. Seguridad y endurecimiento para producción

Cada etapa debe comprobarse antes de comenzar la siguiente.

---

# Estado actual del MVP

Actualmente existe una base funcional de:

* React + Vite
* Express
* MongoDB/Mongoose
* JWT
* Socket.IO
* OpenAI
* Google Gemini
* Publicaciones
* Comentarios
* Likes
* Mensajes
* Generación de imágenes
* Generación de vídeo
* Generación de scripts
* Middleware de autenticación
* Rate limiting
* Helmet
* Compression
* Tests básicos del backend

Las funcionalidades todavía incompletas se implementarán progresivamente siguiendo el roadmap del proyecto.
