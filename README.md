# SISTRA-TEC
SISTRA-TEC: Sistema de Trazabilidad de Donaciones.

## Stack
- Web: Next.js (React)
- API: Node.js + Express (MVC)
- DB: PostgreSQL (Neon) + Prisma
- Auth: JWT + OAuth2 (Google)

## Structure
- apps/api
- apps/web

## Setup
1. npm install
2. Copy env templates:
	- apps/api/.env.example -> apps/api/.env
	- apps/web/.env.local.example -> apps/web/.env.local
3. Run DB migrations: npm run prisma:migrate
4. Start dev: npm run dev
