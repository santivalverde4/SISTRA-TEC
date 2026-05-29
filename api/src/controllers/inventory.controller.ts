import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ver toda la bodega
export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await prisma.inventoryItem.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el inventario' });
  }
};

// Registrar un nuevo tipo de producto en bodega
export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, category, unit } = req.body;
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        unit,
        quantity: 0
      }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el artículo' });
  }
};

// Registrar una Entrada (IN) o Salida (OUT) de stock
export const registerTransaction = async (req: Request, res: Response) => {
  try {
    const { inventoryItemId, type, amount, reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.inventoryTransaction.create({
        data: { inventoryItemId, type, amount, reason }
      });

      const operator = type === 'IN' ? 'increment' : 'decrement';
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          quantity: { [operator]: amount }
        }
      });

      return { transaction, updatedItem };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la transacción' });
  }
};

// Ver el historial de movimientos
export const getItemTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { inventoryItemId: id },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};

// Ver un artículo específico
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el artículo' });
  }
};

// Actualizar información del artículo (solo texto, no cantidades)
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, unit } = req.body;
    
    const updatedItem = await prisma.inventoryItem.update({
      where: { id },
      data: { name, category, unit }
    });
    
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el artículo' });
  }
};

// Eliminar un artículo (si no tiene transacciones)
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Primero verificamos si hay transacciones ligadas
    const transactions = await prisma.inventoryTransaction.count({
      where: { inventoryItemId: id }
    });

    if (transactions > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar porque ya tiene movimientos registrados en bodega.' 
      });
    }

    await prisma.inventoryItem.delete({
      where: { id }
    });
    
    res.json({ message: 'Artículo eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el artículo' });
  }
};