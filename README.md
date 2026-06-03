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

---

## CRUD de Donaciones

El sistema de donaciones permite registrar, seguir y gestionar el ciclo de vida de las donaciones desde su recepción hasta su entrega. Cada donación puede cambiar de estado: **Recibida → Clasificada → En Tránsito → Entregada**.

### Tabla de Endpoints de Donaciones

Se puede probar usando Postman apuntando a http://localhost:4000.

|Método|Endpoint|Descripción|Body (JSON) requerido|
|---|---|---|---|
|POST|/api/donations|Crea una nueva donación e ingresa items a bodega (IN).|"{ ""campaignId"": ""ID"", ""donorId"": ""ID"", ""note"": ""Nota"", ""items"": [{ ""description"": ""Arroz"", ""quantity"": ""50"" }] }"
|GET|/api/donations|Devuelve todas las donaciones con detalles relacionados.|No aplica
|GET|/api/donations/:id|Devuelve los detalles completos de una donación con historial.|No aplica
|PUT|/api/donations/:id|Actualiza la nota y/o items de una donación.|"{ ""note"": ""Nota actualizada"", ""items"": [{ ""description"": ""Frijoles"", ""quantity"": ""30"" }] }"
|DELETE|/api/donations/:id|Elimina una donación y su historial.|No aplica
|PUT|/api/donations/:id/status|Cambia el estado de la donación (valida transiciones y maneja inventario).|"{ ""status"": ""CLASSIFIED"", ""reason"": ""Clasificada"", ""changedBy"": ""USER_ID"" }"
|GET|/api/donations/:id/history|Devuelve el historial completo de cambios de estado.|No aplica
|GET|/api/donations/:id/tracking|Devuelve una vista simplificada del seguimiento para el donante.|No aplica

### Estados de Donación

- **RECEIVED**: Donación registrada en el sistema (estado inicial)
- **CLASSIFIED**: Donación clasificada y lista para tránsito
- **IN_TRANSIT**: Donación en camino hacia el beneficiario
- **DELIVERED**: Donación entregada al beneficiario (estado final)

> **Nota importante**: El sistema registra automáticamente transacciones de inventario:
> - **RECEIVED**: Se crea transacción `IN` - entrada de stock a bodega
> - **DELIVERED**: Se crea transacción `OUT` - salida de stock de bodega (con validación de disponibilidad)

### Endpoints de Donaciones

#### Crear una nueva donación
```
POST /api/donations
```
Body (JSON) requerido:
```json
{
  "campaignId": "ID_CAMPAIGN",
  "donorId": "ID_DONOR",
  "note": "Nota adicional sobre la donación",
  "items": [
    {
      "description": "Arroz",
      "quantity": "50"
    },
    {
      "description": "Frijoles",
      "quantity": "30"
    }
  ]
}
```

#### Obtener todas las donaciones
```
GET /api/donations
```
Respuesta: Array de donaciones con datos relacionados (campaña, donante, items, historial)

#### Obtener donación específica por ID
```
GET /api/donations/:id
```
Respuesta: Donación completa con:
- Información básica
- Campaña relacionada
- Datos del donante
- Items donados
- Historial completo de cambios de estado

#### Actualizar información de donación
```
PUT /api/donations/:id
```
Body (JSON) - campos opcionales:
```json
{
  "note": "Nueva nota",
  "items": [
    {
      "description": "Arroz",
      "quantity": "60"
    }
  ]
}
```

#### Cambiar estado de donación
```
PUT /api/donations/:id/status
```
Body (JSON) requerido:
```json
{
  "status": "CLASSIFIED",
  "reason": "Donación clasificada correctamente",
  "changedBy": "ID_USUARIO"
}
```

Transiciones válidas:
- `RECEIVED` → `CLASSIFIED` o `DELIVERED`
- `CLASSIFIED` → `IN_TRANSIT` o `DELIVERED`
- `IN_TRANSIT` → `DELIVERED`
- `DELIVERED` → (ninguna, es estado final)

#### Obtener historial de cambios de donación
```
GET /api/donations/:id/history
```
Respuesta: Array con todos los cambios de estado, incluyendo:
- Estado anterior
- Nuevo estado
- Fecha del cambio
- Razón del cambio
- Usuario que realizó el cambio

#### Obtener tracking completo de donación
```
GET /api/donations/:id/tracking
```
Respuesta: Vista simplificada del seguimiento con:
- ID de donación
- Nombre de campaña
- Nombre del donante
- Estado actual
- Items donados
- Historial de cambios

#### Eliminar donación
```
DELETE /api/donations/:id
```

---

## Integración Automática con Inventario

El sistema maneja transacciones de inventario automáticamente en dos momentos clave:

### 1. Al Recibir Donación (RECEIVED - IN)
Cuando se crea una donación:
1. **Busca automaticamente** los items en el inventario por nombre
2. **Crea transacciones** de tipo `IN` (entrada)
3. **Suma la cantidad** al stock existente en bodega
4. **Registra la transacción** con referencia a la donación

### 2. Al Entregar Donación (DELIVERED - OUT)
Cuando una donación pasa a estado `DELIVERED`:
1. **Valida disponibilidad** de stock en bodega
2. **Crea transacciones** de tipo `OUT` (salida)
3. **Resta la cantidad** del stock disponible
4. **Registra la transacción** con referencia a la donación

### Flujo de Ejemplo

Suponga una donación recibida con:
- 50 kg de Arroz
- 30 kg de Frijoles

**Al crear (RECEIVED)**:
- Sistema busca "Arroz" en inventario
- Si existe, suma 50 kg al stock actual
- Crea transacción IN: `"Ingreso por recepción de donación #DONATION_ID"`
- Repite para "Frijoles" con 30 kg

**Al entregar (DELIVERED)**:
- Sistema valida que hay ≥50 kg Arroz y ≥30 kg Frijoles
- Si hay stock, resta 50 kg Arroz
- Crea transacción OUT: `"Salida por entrega de donación #DONATION_ID"`
- Repite para "Frijoles" con 30 kg
- Si no hay stock suficiente, rechaza la operación


