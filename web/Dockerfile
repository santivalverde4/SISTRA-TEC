FROM node:18

WORKDIR /app

COPY package*.json ./
RUN rm -f package-lock.json && \
    npm install && \
    npm install @tailwindcss/oxide-linux-x64-gnu

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]