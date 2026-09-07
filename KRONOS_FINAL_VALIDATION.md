# KRONOS, validación actual

## Código revisado

- Frontend: rutas, Auth, App, ProtectedRoute, storage, API client, Socket.IO.
- Backend: server, CORS, auth routes, JWT middleware, User, DB config.
- Contrato de login: alineado a `{ token, user }`.
- CORS local: alineado a Vite en `http://localhost:3000`.
- Secretos: no se añadieron claves al frontend.

## Ejecución

| Prueba | Resultado |
|---|---|
| `npm install` | No ejecutada en entorno conectado al repositorio |
| `npm run build` | Pendiente de ejecutar en checkout local |
| `npm run lint` | No existe script lint definido |
| `npm test --workspace=server` | Pendiente de ejecutar con dependencias instaladas |
| `GET /health` producción | No verificable desde esta sesión, URL no respondió al fetch público |
| Login correcto | Contrato revisado, prueba E2E pendiente por falta de cuenta/env |
| Password incorrecta | Backend devuelve 401, UI muestra error |
| Email inexistente | Backend devuelve 401, UI muestra error |
| Token inválido/expirado | Middleware devuelve 401 y App limpia sesión |
| Backend apagado | UI muestra error de conexión |
| MongoDB no disponible | Desarrollo usa fallback en memoria; producción falla de forma explícita |
| Reload autenticado | Storage compartido implementado, E2E pendiente |
| Logout | Limpia localStorage y sessionStorage |

## Bloqueos honestos

- No hay credenciales de prueba disponibles.
- No hay un entorno remoto funcional accesible para probar login real.
- El repositorio no define lint frontend.
- Las funcionalidades de la matriz 001-045 todavía no están todas implementadas.

No se declara producción lista ni se declara el plan completo terminado.
