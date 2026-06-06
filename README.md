# SISTRA-TEC

Sistema de Trazabilidad de Campañas Humanitarias.

## Stack

- **Frontend** — Next.js 14 App Router + Tailwind CSS
- **Backend** — Node.js + Express + TypeScript
- **Base de datos** — PostgreSQL (Neon) + Prisma ORM
- **Auth** — JWT + OAuth2 (Google) + recuperación por email (Brevo)

## Estructura

```
web/   Next.js frontend
api/   Express REST API
```

## Configuración

### Frontend

```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

### Backend

```bash
cd api
npm install
cp .env.example .env   # completar variables
npm run dev
```

El servidor queda en `http://localhost:4000`.

## Base de datos

```bash
cd api
npm run db:fresh       # reset + seed (datos de prueba)
npm run db:reset       # solo borrar todos los datos
npm run db:seed        # solo insertar datos de prueba
npm run prisma:migrate # aplicar migraciones pendientes
npm run prisma:studio  # abrir Prisma Studio
```

### Cuentas del seed

| Email | Contraseña | Rol |
|---|---|---|
| admin@sistratec.com | Admin123 | Administrador |
| donante1@example.com | Donor123 | Donante |
| donante2@example.com | Donor123 | Donante |
| transportista@example.com | Trans123 | Transportista |

## Roles

| Rol | Acceso |
|---|---|
| `ADMIN_CENTER` | Gestión de campañas, asignación de transportistas, trazabilidad global |
| `DONOR` | Ver campañas disponibles, registrar donaciones, seguimiento |
| `TRANSPORTER` | Ver asignaciones, registrar eventos de transporte |

## Colección Postman

Ver `api/postman_collection.json` para todos los endpoints documentados.
