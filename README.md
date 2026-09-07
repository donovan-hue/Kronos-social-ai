# Kronos Social AI

Plataforma web de red social con funcionalidades de inteligencia artificial.

## Desarrollo local

Requisitos: Node.js 20.x, npm y MongoDB.

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000`  
Health: `http://localhost:5000/health`

`CLIENT_URL` debe incluir el origen exacto del frontend. En local es `http://localhost:3000`. Para producción usa la URL real del frontend, separando múltiples orígenes con comas. `VITE_API_URL` debe apuntar al backend con el sufijo `/api`.

No coloques secretos en variables `VITE_*` ni subas archivos `.env`.

## Scripts

- `npm run dev`: frontend y backend.
- `npm run client`: solo frontend.
- `npm run server`: solo backend.
- `npm run build`: build del frontend.
- `npm test --workspace=server`: pruebas backend.

## API base

Auth: `POST /api/auth/register`, `POST /api/auth/login`  
Social: `/api/posts`, `/api/users`, `/api/messages`, `/api/notifications`  
Kairos: `/api/ai/images`, `/api/ai/videos`, `/api/ai/scripts`
