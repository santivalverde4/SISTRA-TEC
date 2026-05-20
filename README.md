# SISTRA-TEC
Sistema de Trazabilidad de Donaciones.

## Stack
- Web: Next.js (React) + Tailwind + Shadcn UI
- API: Node.js + Express (MVC)
- DB: PostgreSQL (Neon) + Prisma
- Auth: JWT + OAuth2 (Google)

## Structure
- `web/` — Next.js frontend
- `api/` — Node.js REST API

## Setup

### Web
```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev
```

### API
```bash
cd api
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```
