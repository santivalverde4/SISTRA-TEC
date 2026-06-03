import express from 'express';
import inventoryRoutes from './routes/inventory.routes';
import { authRoutes } from './routes/authRoutes';
import { app } from './app';
import { env } from './config/env';

const port = env.PORT ?? 4000;

app.use(express.json());

// Rutas
app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API corriendo en Docker con Express y TypeScript');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});