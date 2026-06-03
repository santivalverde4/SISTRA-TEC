import { Router } from 'express';
import { Role } from '@prisma/client';
import { authJwt } from '../middlewares/authJwt';
import { requireRoles } from '../middlewares/requireRoles';
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
router.post('/', authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), createItem);
router.post('/transaction', authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), registerTransaction);

// Rutas específicas por ID de producto
router.get('/:id', getItemById);
router.put('/:id', authJwt, requireRoles(Role.ADMIN_CENTER), updateItem);
router.delete('/:id', authJwt, requireRoles(Role.ADMIN_CENTER), deleteItem);
router.get('/:id/transactions', authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), getItemTransactions);

export default router;