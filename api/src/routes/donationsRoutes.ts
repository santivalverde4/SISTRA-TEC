import { Router } from 'express';
import {
  createDonation,
  getAllDonations,
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

// Rutas específicas por ID
router.get('/:id', getDonationById); // Obtener donación por ID
router.put('/:id', updateDonation); // Actualizar donación
router.delete('/:id', deleteDonation); // Eliminar donación

// Rutas de estado y tracking
router.put('/:id/status', changeDonationStatus); // Cambiar estado
router.get('/:id/history', getDonationHistory); // Obtener historial de cambios
router.get('/:id/tracking', getDonationTracking); // Obtener tracking completo

export default router;
