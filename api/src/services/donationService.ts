import { DonationStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

// Crear una nueva donación
export const createDonation = async (data: {
  campaignId: string;
  donorId: string;
  note?: string;
  items: Array<{ description: string; quantity: string | number }>;
}) => {
  try {
    const donation = await prisma.$transaction(async (tx) => {
      // Crear la donación
      const newDonation = await tx.donation.create({
        data: {
          campaignId: data.campaignId,
          donorId: data.donorId,
          note: data.note,
          status: 'RECEIVED',
        },
        include: { items: true },
      });

      // Crear los items de donación
      await tx.donationItem.createMany({
        data: data.items.map((item) => ({
          donationId: newDonation.id,
          description: item.description,
          quantity: parseFloat(String(item.quantity)) || 0,
        })),
      });

      // Registrar en el historial
      await tx.donationHistory.create({
        data: {
          donationId: newDonation.id,
          status: 'RECEIVED',
          reason: 'Donación registrada en el sistema',
          changedBy: data.donorId,
        },
      });

      // Crear transacción IN en inventario para cada item
      for (const item of data.items) {
        const quantity = parseFloat(String(item.quantity)) || 0;
        
        // Buscar o crear el item de inventario
        let inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            name: {
              contains: item.description,
              mode: 'insensitive',
            },
          },
        });

        // Si no existe, crear un nuevo item
        if (!inventoryItem) {
          inventoryItem = await tx.inventoryItem.create({
            data: {
              name: item.description,
              category: 'Otros',
              unit: 'kg',
              quantity: 0,
            },
          });
        }

        // Crear transacción IN
        await tx.inventoryTransaction.create({
          data: {
            inventoryItemId: inventoryItem.id,
            type: 'IN',
            amount: quantity,
            reason: `Ingreso por recepción de donación #${newDonation.id}`,
          },
        });

        // Actualizar cantidad en inventario
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });
      }

      return newDonation;
    });

    return donation;
  } catch (error) {
    throw new Error(`Error al crear la donación: ${error}`);
  }
};

// Obtener todas las donaciones
export const getAllDonations = async () => {
  try {
    const donations = await prisma.donation.findMany({
      include: {
        campaign: true,
        donor: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return donations;
  } catch (error) {
    throw new Error(`Error al obtener las donaciones: ${error}`);
  }
};

// Obtener donaciones de un donante autenticado
export const getDonationsByDonorId = async (donorId: string) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { donorId },
      include: {
        campaign: true,
        donor: true,
        items: true,
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return donations;
  } catch (error) {
    throw new Error(`Error al obtener las donaciones del usuario: ${error}`);
  }
};

// Obtener donación por ID
export const getDonationById = async (id: string) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: true,
        donor: true,
        items: true,
        history: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!donation) {
      throw new Error('Donación no encontrada');
    }

    return donation;
  } catch (error) {
    throw new Error(`Error al obtener la donación: ${error}`);
  }
};

// Actualizar información básica de la donación
export const updateDonation = async (
  id: string,
  data: {
    note?: string;
    items?: Array<{ description: string; quantity: string | number }>;
  }
) => {
  try {
    const donation = await prisma.$transaction(async (tx) => {
      // Verificar que la donación exista
      const existingDonation = await tx.donation.findUnique({
        where: { id },
      });

      if (!existingDonation) {
        throw new Error('Donación no encontrada');
      }

      // Actualizar la donación
      const updated = await tx.donation.update({
        where: { id },
        data: {
          note: data.note,
        },
      });

      // Si se proporcionan items, actualizar los existentes
      if (data.items) {
        await tx.donationItem.deleteMany({
          where: { donationId: id },
        });

        await tx.donationItem.createMany({
          data: data.items.map((item) => ({
            donationId: id,
            description: item.description,
            quantity: parseFloat(String(item.quantity)) || 0,
          })),
        });
      }

      return updated;
    });

    return donation;
  } catch (error) {
    throw new Error(`Error al actualizar la donación: ${error}`);
  }
};

// Cambiar estado de la donación
export const changeDonationStatus = async (
  id: string,
  newStatus: DonationStatus,
  reason?: string,
  changedBy?: string
) => {
  try {
    const donation = await prisma.$transaction(async (tx) => {
      // Obtener la donación actual
      const currentDonation = await tx.donation.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!currentDonation) {
        throw new Error('Donación no encontrada');
      }

      // Validar transición de estados
      const validTransitions: Record<DonationStatus, DonationStatus[]> = {
        RECEIVED: ['CLASSIFIED', 'DELIVERED'],
        CLASSIFIED: ['IN_TRANSIT', 'DELIVERED'],
        IN_TRANSIT: ['DELIVERED'],
        DELIVERED: [], // Estado final
      };

      if (!validTransitions[currentDonation.status].includes(newStatus)) {
        throw new Error(
          `No se puede cambiar de ${currentDonation.status} a ${newStatus}`
        );
      }

      // Actualizar el estado
      const updated = await tx.donation.update({
        where: { id },
        data: { status: newStatus },
      });

      // Registrar en el historial
      await tx.donationHistory.create({
        data: {
          donationId: id,
          status: newStatus,
          reason: reason || `Estado cambiado a ${newStatus}`,
          changedBy,
        },
      });

      // Si la donación se entrega, restar el stock del inventario
      if (newStatus === 'DELIVERED') {
        for (const item of currentDonation.items) {
          const quantity = item.quantity; // Ya es Float desde la BD
          
          let inventoryItem = await tx.inventoryItem.findFirst({
            where: {
              name: {
                contains: item.description,
                mode: 'insensitive',
              },
            },
          });

          // Si no existe, crear un nuevo item
          if (!inventoryItem) {
            inventoryItem = await tx.inventoryItem.create({
              data: {
                name: item.description,
                category: 'Otros',
                unit: 'kg',
                quantity: 0,
              },
            });
          }

          // Verificar que hay suficiente stock
          if (inventoryItem.quantity < quantity) {
            throw new Error(
              `Stock insuficiente de ${item.description}. Disponible: ${inventoryItem.quantity}, Requerido: ${quantity}`
            );
          }

          // Crear transacción de inventario (OUT)
          await tx.inventoryTransaction.create({
            data: {
              inventoryItemId: inventoryItem.id,
              type: 'OUT',
              amount: quantity,
              reason: `Salida por entrega de donación #${id}`,
            },
          });

          // Actualizar cantidad en inventario
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: {
                decrement: quantity,
              },
            },
          });
        }
      }

      return updated;
    });

    return donation;
  } catch (error) {
    throw new Error(`Error al cambiar el estado de la donación: ${error}`);
  }
};

// Obtener historial de cambios de estado
export const getDonationHistory = async (donationId: string) => {
  try {
    const history = await prisma.donationHistory.findMany({
      where: { donationId },
      orderBy: { changedAt: 'desc' },
    });

    if (history.length === 0) {
      throw new Error('No se encontró historial para esta donación');
    }

    return history;
  } catch (error) {
    throw new Error(`Error al obtener el historial: ${error}`);
  }
};

// Eliminar donación
export const deleteDonation = async (id: string) => {
  try {
    const donation = await prisma.$transaction(async (tx) => {
      // Verificar que existe
      const existing = await tx.donation.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('Donación no encontrada');
      }

      // Eliminar historial primero (por restricciones de FK)
      await tx.donationHistory.deleteMany({
        where: { donationId: id },
      });

      // Eliminar items
      await tx.donationItem.deleteMany({
        where: { donationId: id },
      });

      // Eliminar donación
      const deleted = await tx.donation.delete({
        where: { id },
      });

      return deleted;
    });

    return donation;
  } catch (error) {
    throw new Error(`Error al eliminar la donación: ${error}`);
  }
};
