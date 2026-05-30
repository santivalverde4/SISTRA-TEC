FROM node:18-slim

# Instalar OpenSSL (Requerido por Prisma en Debian slim)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generar cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 4000

# Arrancar con ts-node
CMD ["npm", "start"]