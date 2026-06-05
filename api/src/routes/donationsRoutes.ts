import { Router } from 'express';
import { authJwt } from '../middlewares/authJwt';
import {
  createDonation,
  getAllDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  changeDonationStatus,
  getDonationHistory,
  getDonationTracking,
  deleteDonation,
} from '../controllers/donationsController';

const router = Router();

// Rutas generales
router.post('/', createDonation); // Crear donación
router.get('/', getAllDonations); // Obtener todas las donaciones
router.get('/me', authJwt, getMyDonations); // Obtener donaciones del usuario autenticado

// Rutas específicas por ID
router.get('/:id', getDonationById); // Obtener donación por ID
router.put('/:id', updateDonation); // Actualizar donación
router.delete('/:id', deleteDonation); // Eliminar donación

// Rutas de estado y tracking
router.put('/:id/status', changeDonationStatus); // Cambiar estado
router.get('/:id/history', getDonationHistory); // Obtener historial de cambios
router.get('/:id/tracking', authJwt, getDonationTracking); // Obtener tracking completo

export default router;
