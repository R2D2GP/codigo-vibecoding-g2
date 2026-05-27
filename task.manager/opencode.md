# Task Manager - Configuration

## Proyectos

| Proyecto | Ruta | Stack |
|----------|------|-------|
| backend | `backend/` | Node.js, Express, Prisma (PostgreSQL), JWT, bcryptjs, Swagger |
| frontend | `frontend/` | React 19, Vite, Tailwind CSS 4, React Router 7, Axios |

## Comunicación

- **Frontend → Backend**: REST API en `http://localhost:3000/api`
- **Rutas actuales**:
  - `/api/tasks` - CRUD de tareas
  - `/api/users` - CRUD de usuarios
  - `/api-docs` - Swagger UI
- **Puerto Backend**: 3000
- **Puerto Frontend**: 5173 (Vite default)

## Estructura de Features

Para crear features que involucren ambos proyectos, usar el siguiente enfoque:

```
característica-nueva/
├── backend/src/domain/[feature]/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── models/
└── frontend/src/
    ├── pages/[FeaturePage].jsx
    ├── components/[FeatureComponent].jsx
    └── services/ (actualizar api.js)
```

## Separación de Tareas

| Tipo de tarea | Backend | Frontend |
|---------------|---------|----------|
| Nuevo campo en tarea | Schema Prisma, migración, controller, service | Form component, state |
| Nueva entidad | Domain completo (models, controllers, routes, services) | Nueva página, componentes |
| Autenticación | JWT, bcrypt, middleware | Auth context, login page, protected routes |
| Validación | Zod/express-validator en controller | Form validation, feedback UI |
| UI/UX | No aplica | Componentes, estilos, animaciones |

## Scripts

> **Importante**: Los siguientes comandos deben ejecutarse **manualmente** por el usuario. La IA nunca debe ejecutar `npm run dev` ni ningún comando de inicio de servidores.

```bash
# Backend (manual)
cd backend && npm run dev    # Puerto 3000

# Frontend (manual)
cd frontend && npm run dev   # Puerto 5173
```

## Notas

- El frontend usa Axios para llamadas HTTP
- El backend usa arquitectura por dominio (`domain/tasks`, `domain/users`)
- CORS configurado para permitir todas las orígenes en desarrollo