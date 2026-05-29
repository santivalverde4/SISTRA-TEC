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

# API Sistema de Donaciones

Backend del sistema de gestión de donaciones, logística y control de inventario. Este proyecto está construido con Node.js, Express, TypeScript, Prisma (Neon PostgreSQL) y Docker.

## Requisitos Previos

Para ejecutar este proyecto localmente se necesita tener instalado:
* Docker Desktop (Debe estar activo y ejecutándose en segundo plano).
* Git

---

## Guía de Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd api
```
### 2. Variables de entorno (.env)

Crear un archivo `.env` en la raíz del la carpeta api, copiar la estructura del archivo `.env.example` y completar las variables de entorno necesarias:

### 3. Levantar el proyecto con Docker
No es necesario hacer npm install localmente. Docker se encarga de descargar Node, instalar las dependencias, generar el cliente de Prisma y levantar el servidor.

Ejecutar el siguiente comando en la terminal (asegurandonos de estar en la misma carpeta que el archivo docker-compose.yml, la de api):

```bash
docker-compose up --build
```

Si todo funciono va a salir esto en la terminal:

```
Servidor escuchando en el puerto 4000
```

## Base de Datos y Semillas (Seeds)
La base de datos está alojada en la nube usando Neon. Ya cuenta con la estructura oficial definida en prisma/schema.prisma y ha sido poblada con datos de prueba (roles, estados de campaña y un inventario con un elemento).

No es necesario ejecutar migraciones a menos que se agreguen nuevas tablas al schema.

## Endpoints

El CRUD de inventario está funcional, se puede probar usando Postman apuntando a http://localhost:4000.

|Método|Endpoint|Descripción|Body (JSON) requerido|
|---|---|---|---|
|GET|/api/inventory|Devuelve todos los artículos en bodega.|No aplica
|POST|/api/inventory|Registra un nuevo tipo de artículo (cantidad inicial 0).|"{ ""name"": ""Arroz"", ""category"": ""Alimentos"", ""unit"": ""kg"" }"
|GET|/api/inventory/:id|Devuelve los detalles de un artículo específico.|No aplica
|PUT|/api/inventory/:id|"Actualiza la información base del artículo (nombre, categoría)."|"{ ""name"": ""Arroz Blanco"", ""category"": ""Alimentos"", ""unit"": ""kg"" }"
|DELETE|/api/inventory/:id|Elimina un artículo (Falla si ya tiene movimientos).|No aplica

## Transacciones de Inventario

- POST /api/inventory/transaction

Ejemplo de entrada (IN):

```json
{
  "inventoryItemId": "ID_DEL_ARTICULO",
  "type": "IN",
  "amount": 50,
  "reason": "Ingreso por donación de Campaña Norte"
}
```

Ejemplo de salida (OUT):

```json
{
  "inventoryItemId": "ID_DEL_ARTICULO",
  "type": "OUT",
  "amount": 20,
  "reason": "Salida para entrega a beneficiarios"
}
```


