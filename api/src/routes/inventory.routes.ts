import { Router } from 'express';
import { 
  getInventory, 
  createItem, 
  registerTransaction, 
  getItemTransactions,
  getItemById,
  updateItem,
  deleteItem
} from '../controllers/inventory.controller';

const router = Router();

// Rutas generales
router.get('/', getInventory);
router.post('/', createItem);
router.post('/transaction', registerTransaction);

// Rutas específicas por ID de producto
router.get('/:id', getItemById);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.get('/:id/transactions', getItemTransactions);

export default router;