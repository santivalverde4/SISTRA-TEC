import { Role } from "@prisma/client";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";

const campaignStatusToFrontend: Record<string, string> = {
  OPEN: "abierta",
  FROZEN: "congelada",
  CLOSED: "cerrada",
  IN_TRANSIT: "en-camino",
  DELIVERED: "entregada",
  FINALIZED: "finalizada",
};

const formatAssignment = (assignment: any) => ({
  id: assignment.id,
  assignmentId: assignment.id,
  campaignId: assignment.campaignId,
  campaignName: assignment.campaign.name,
  destination: assignment.destination,
  distanceKm: assignment.distanceKm,
  km: String(assignment.distanceKm),
  status: campaignStatusToFrontend[assignment.campaign.status] ?? assignment.campaign.status,
  rawStatus: assignment.campaign.status,
  departureDate: assignment.departureDate,
  estimatedArrival: assignment.estimatedArrival,
});

const formatTransporter = (transporter: any) => ({
  id: transporter.id,
  userId: transporter.userId,
  name: transporter.user.name,
  email: transporter.user.email,
  phone: transporter.user.phone ?? undefined,
  address: transporter.user.address ?? undefined,
  vehicle: transporter.vehicle,
  plate: transporter.plate,
  assignments: transporter.assignments?.map(formatAssignment) ?? [],
});

const transporterInclude = {
  user: {
    select: { id: true, name: true, email: true, role: true, phone: true, address: true },
  },
  assignments: {
    include: { campaign: true },
    orderBy: { departureDate: "desc" as const },
  },
};

export const listTransporters = async () => {
  const transporters = await prisma.transporter.findMany({
    include: transporterInclude,
    orderBy: { id: "asc" },
  });

  return transporters.map(formatTransporter);
};

export const getTransporterById = async (id: string) => {
  const transporter = await prisma.transporter.findUnique({
    where: { id },
    include: transporterInclude,
  });

  if (!transporter) {
    throw new HttpError(404, "Transporter not found");
  }

  return formatTransporter(transporter);
};

export const getTransporterByUserId = async (userId: string) => {
  const transporter = await prisma.transporter.findUnique({
    where: { userId },
    include: transporterInclude,
  });

  if (!transporter) {
    throw new HttpError(404, "Transporter profile not found");
  }

  return formatTransporter(transporter);
};

export const createTransporter = async (data: { userId?: string; vehicle?: string; plate?: string; phone?: string }) => {
  if (!data.userId || !data.vehicle || !data.plate) {
    throw new HttpError(400, "userId, vehicle and plate are required");
  }

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (user.role !== Role.TRANSPORTER) {
    throw new HttpError(400, "User must have TRANSPORTER role");
  }

  const transporter = await prisma.transporter.create({
    data: {
      userId: data.userId,
      vehicle: data.vehicle,
      plate: data.plate,
      ...(data.phone ? { phone: data.phone } : {}),
    },
    include: transporterInclude,
  });

  return formatTransporter(transporter);
};

export const updateTransporter = async (
  id: string,
  data: { vehicle?: string; plate?: string; phone?: string }
) => {
  try {
    const transporter = await prisma.transporter.update({
      where: { id },
      data: {
        ...(data.vehicle !== undefined ? { vehicle: data.vehicle } : {}),
        ...(data.plate !== undefined ? { plate: data.plate } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
      include: transporterInclude,
    });

    return formatTransporter(transporter);
  } catch {
    throw new HttpError(404, "Transporter not found");
  }
};

export const updateTransporterByUserId = async (
  userId: string,
  data: { vehicle?: string; plate?: string; phone?: string }
) => {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) {
    throw new HttpError(404, "Transporter profile not found");
  }

  return updateTransporter(transporter.id, data);
};
