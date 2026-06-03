import { Request, Response } from 'express';
import * as donationService from '../services/donationService';

// Crear una nueva donación
export const createDonation = async (req: Request, res: Response) => {
  try {
    const { campaignId, donorId, note, items } = req.body;

    // Validar datos requeridos
    if (!campaignId || !donorId || !items || items.length === 0) {
      return res.status(400).json({
        error: 'campaignId, donorId e items son requeridos',
      });
    }

    const donation = await donationService.createDonation({
      campaignId,
      donorId,
      note,
      items,
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// Obtener todas las donaciones
export const getAllDonations = async (req: Request, res: Response) => {
  try {
    const donations = await donationService.getAllDonations();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// Obtener donación por ID
export const getDonationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID de donación es requerido' });
    }

    const donation = await donationService.getDonationById(id);
    res.json(donation);
  } catch (error) {
    res.status(404).json({ error: String(error) });
  }
};

// Actualizar donación
export const updateDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note, items } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID de donación es requerido' });
    }

    const updatedDonation = await donationService.updateDonation(id, {
      note,
      items,
    });

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// Cambiar estado de la donación
export const changeDonationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason, changedBy } = req.body;

    if (!id || !status) {
      return res
        .status(400)
        .json({ error: 'ID de donación y status son requeridos' });
    }

    const updatedDonation = await donationService.changeDonationStatus(
      id,
      status,
      reason,
      changedBy
    );

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};

// Obtener historial de cambios de estado
export const getDonationHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID de donación es requerido' });
    }

    const history = await donationService.getDonationHistory(id);
    res.json(history);
  } catch (error) {
    res.status(404).json({ error: String(error) });
  }
};

// Obtener tracking de donación
export const getDonationTracking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID de donación es requerido' });
    }

    const donation = await donationService.getDonationById(id);

    const tracking = {
      donationId: donation.id,
      campaign: donation.campaign.name,
      donor: donation.donor.name,
      currentStatus: donation.status,
      items: donation.items,
      history: donation.history.map((h) => ({
        status: h.status,
        changedAt: h.changedAt,
        reason: h.reason,
        changedBy: h.changedBy,
      })),
    };

    res.json(tracking);
  } catch (error) {
    res.status(404).json({ error: String(error) });
  }
};

// Eliminar donación
export const deleteDonation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID de donación es requerido' });
    }

    const deletedDonation = await donationService.deleteDonation(id);
    res.json({ message: 'Donación eliminada exitosamente', deletedDonation });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
};
