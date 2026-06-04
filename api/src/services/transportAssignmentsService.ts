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

const parseDate = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, `${field} is required`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `${field} must be a valid date`);
  }

  return date;
};

const parseDistance = (value: unknown) => {
  const distance = Number(value);
  if (!Number.isFinite(distance) || distance < 0) {
    throw new HttpError(400, "distanceKm must be a positive number");
  }

  return Math.round(distance);
};

const assignmentInclude = {
  campaign: true,
  transporter: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  events: {
    orderBy: { occurredAt: "desc" as const },
  },
};

const formatAssignment = (assignment: any) => ({
  id: assignment.id,
  campaignId: assignment.campaignId,
  campaign: {
    ...assignment.campaign,
    rawStatus: assignment.campaign.status,
    status: campaignStatusToFrontend[assignment.campaign.status] ?? assignment.campaign.status,
  },
  transporterId: assignment.transporterId,
  transporter: {
    id: assignment.transporter.id,
    userId: assignment.transporter.userId,
    name: assignment.transporter.user.name,
    email: assignment.transporter.user.email,
    vehicle: assignment.transporter.vehicle,
    plate: assignment.transporter.plate,
  },
  destination: assignment.destination,
  distanceKm: assignment.distanceKm,
  km: String(assignment.distanceKm),
  departureDate: assignment.departureDate,
  estimatedArrival: assignment.estimatedArrival,
  eventsCount: assignment.events?.length ?? 0,
  events: assignment.events ?? [],
});

const ensureTransporterAssignmentAccess = async (assignmentId: string, userId: string, role: Role) => {
  if (role === "ADMIN_CENTER") {
    return;
  }

  const assignment = await prisma.transportAssignment.findUnique({
    where: { id: assignmentId },
    include: { transporter: true },
  });

  if (!assignment) {
    throw new HttpError(404, "Transport assignment not found");
  }

  if (role !== "TRANSPORTER" || assignment.transporter.userId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
};

export const listAssignments = async () => {
  const assignments = await prisma.transportAssignment.findMany({
    include: assignmentInclude,
    orderBy: { departureDate: "desc" },
  });

  return assignments.map(formatAssignment);
};

export const getAssignmentById = async (id: string, userId: string, role: Role) => {
  await ensureTransporterAssignmentAccess(id, userId, role);

  const assignment = await prisma.transportAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw new HttpError(404, "Transport assignment not found");
  }

  return formatAssignment(assignment);
};

export const createOrUpdateCampaignAssignment = async (
  campaignId: string,
  data: {
    transporterId?: string;
    destination?: string;
    distanceKm?: unknown;
    departureDate?: string;
    estimatedArrival?: string;
  }
) => {
  if (!data.transporterId || !data.destination) {
    throw new HttpError(400, "transporterId and destination are required");
  }

  const [campaign, transporter] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: campaignId } }),
    prisma.transporter.findUnique({ where: { id: data.transporterId } }),
  ]);

  if (!campaign) {
    throw new HttpError(404, "Campaign not found");
  }

  if (!transporter) {
    throw new HttpError(404, "Transporter not found");
  }

  const assignment = await prisma.transportAssignment.upsert({
    where: { campaignId },
    create: {
      campaignId,
      transporterId: data.transporterId,
      destination: data.destination,
      distanceKm: parseDistance(data.distanceKm),
      departureDate: parseDate(data.departureDate, "departureDate"),
      estimatedArrival: parseDate(data.estimatedArrival, "estimatedArrival"),
    },
    update: {
      transporterId: data.transporterId,
      destination: data.destination,
      distanceKm: parseDistance(data.distanceKm),
      departureDate: parseDate(data.departureDate, "departureDate"),
      estimatedArrival: parseDate(data.estimatedArrival, "estimatedArrival"),
    },
    include: assignmentInclude,
  });

  return formatAssignment(assignment);
};

export const updateAssignment = async (
  id: string,
  data: {
    transporterId?: string;
    destination?: string;
    distanceKm?: unknown;
    departureDate?: string;
    estimatedArrival?: string;
  }
) => {
  try {
    const assignment = await prisma.transportAssignment.update({
      where: { id },
      data: {
        ...(data.transporterId !== undefined ? { transporterId: data.transporterId } : {}),
        ...(data.destination !== undefined ? { destination: data.destination } : {}),
        ...(data.distanceKm !== undefined ? { distanceKm: parseDistance(data.distanceKm) } : {}),
        ...(data.departureDate !== undefined
          ? { departureDate: parseDate(data.departureDate, "departureDate") }
          : {}),
        ...(data.estimatedArrival !== undefined
          ? { estimatedArrival: parseDate(data.estimatedArrival, "estimatedArrival") }
          : {}),
      },
      include: assignmentInclude,
    });

    return formatAssignment(assignment);
  } catch {
    throw new HttpError(404, "Transport assignment not found");
  }
};

export const deleteAssignment = async (id: string) => {
  const assignment = await prisma.transportAssignment.findUnique({ where: { id } });
  if (!assignment) {
    throw new HttpError(404, "Transport assignment not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.transportEvent.deleteMany({ where: { assignmentId: id } });
    await tx.transportAssignment.delete({ where: { id } });
  });

  return { message: "Transport assignment deleted successfully" };
};

export const listAssignmentsForTransporter = async (userId: string) => {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) {
    throw new HttpError(404, "Transporter profile not found");
  }

  const assignments = await prisma.transportAssignment.findMany({
    where: { transporterId: transporter.id },
    include: {
      campaign: true,
      events: true,
    },
    orderBy: { departureDate: "desc" },
  });

  return assignments.map((assignment) => ({
    assignmentId: assignment.id,
    id: assignment.campaignId,
    campaignId: assignment.campaignId,
    name: assignment.campaign.name,
    status: campaignStatusToFrontend[assignment.campaign.status] ?? assignment.campaign.status,
    rawStatus: assignment.campaign.status,
    destination: assignment.destination,
    km: String(assignment.distanceKm),
    distanceKm: assignment.distanceKm,
    departureDate: assignment.departureDate,
    estimatedArrival: assignment.estimatedArrival,
    eventsCount: assignment.events.length,
  }));
};

export const ensureAssignmentAccess = ensureTransporterAssignmentAccess;
