import express from 'express';
import inventoryRoutes from './routes/inventory.routes';

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Rutas
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
  res.send('API corriendo en Docker con Express y TypeScript');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});