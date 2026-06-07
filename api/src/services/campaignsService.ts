import { CampaignStatus } from "@prisma/client";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";

const campaignStatusMap: Record<string, CampaignStatus> = {
  abierta: "OPEN",
  congelada: "FROZEN",
  cerrada: "CLOSED",
  "en-camino": "IN_TRANSIT",
  entregada: "DELIVERED",
  finalizada: "FINALIZED",
};

const campaignStatusToFrontend: Record<CampaignStatus, string> = {
  OPEN: "abierta",
  FROZEN: "congelada",
  CLOSED: "cerrada",
  IN_TRANSIT: "en-camino",
  DELIVERED: "entregada",
  FINALIZED: "finalizada",
};

export const normalizeCampaignStatus = (status: unknown): CampaignStatus | undefined => {
  if (typeof status !== "string" || !status.trim()) {
    return undefined;
  }

  const value = status.trim();
  const upperValue = value.toUpperCase() as CampaignStatus;
  if (Object.values(CampaignStatus).includes(upperValue)) {
    return upperValue;
  }

  return campaignStatusMap[value.toLowerCase()];
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

const parseCategories = (value: unknown) => {
  if (!Array.isArray(value)) {
    throw new HttpError(400, "categories must be an array");
  }

  return value.map((category) => String(category).trim()).filter(Boolean);
};

const formatAssignment = (assignment: any) => {
  if (!assignment) {
    return undefined;
  }

  return {
    id: assignment.id,
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
  };
};

const formatCampaign = (campaign: any) => ({
  id: campaign.id,
  name: campaign.name,
  description: campaign.description,
  status: campaignStatusToFrontend[campaign.status as CampaignStatus],
  rawStatus: campaign.status,
  startDate: campaign.startDate,
  endDate: campaign.endDate,
  categories: campaign.categories,
  donationsCount: campaign._count?.donations ?? campaign.donations?.length ?? 0,
  assignment: formatAssignment(campaign.assignment),
});

const campaignInclude = {
  assignment: {
    include: {
      transporter: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  },
  _count: {
    select: { donations: true },
  },
};

export const listCampaigns = async (filters: {
  search?: string;
  status?: string;
  category?: string;
  requesterId?: string; // quien pide ver
}) => {
  const status = normalizeCampaignStatus(filters.status);

  const where: any = {
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
    ...(filters.category ? { categories: { has: filters.category } } : {}),
  };

  if (filters.requesterId) {
    where.createdById = filters.requesterId; // solo los propios
  }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: campaignInclude,
    orderBy: { startDate: "desc" },
  });

  return campaigns.map(formatCampaign);
};

export const getCampaignById = async (id: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: campaignInclude,
  });

  if (!campaign) {
    throw new HttpError(404, "Campaign not found");
  }

  return formatCampaign(campaign);
};

export const createCampaign = async (data: {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  categories?: unknown;
  createdById?: string;
}) => {
  if (!data.name?.trim()) {
    throw new HttpError(400, "name is required");
  }

  const status = normalizeCampaignStatus(data.status) ?? "OPEN";
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name.trim(),
      description: data.description,
      status,
      startDate: parseDate(data.startDate, "startDate"),
      endDate: parseDate(data.endDate, "endDate"),
      categories: parseCategories(data.categories ?? []),
      createdBy: { 
        connect: { id: data.createdById as string } 
      },
    },
    include: campaignInclude,
  });

  return formatCampaign(campaign);
};

export const updateCampaign = async (
  id: string,
  data: {
    name?: string;
    description?: string | null;
    status?: string;
    startDate?: string;
    endDate?: string;
    categories?: unknown;
    requesterId?: string; // quien pide cambiar
  }
) => {
  const status = normalizeCampaignStatus(data.status);

  try {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new HttpError(404, "Campaign not found");

    // solo los propios
    if (data.requesterId && campaign.createdById !== data.requesterId) {
      throw new HttpError(403, "Forbidden");
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(status ? { status } : {}),
        ...(data.startDate !== undefined ? { startDate: parseDate(data.startDate, "startDate") } : {}),
        ...(data.endDate !== undefined ? { endDate: parseDate(data.endDate, "endDate") } : {}),
        ...(data.categories !== undefined ? { categories: parseCategories(data.categories) } : {}),
      },
      include: campaignInclude,
    });

    return formatCampaign(updated);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(404, "Campaign not found");
  }
};

export const updateCampaignStatus = async (id: string, statusValue: unknown) => {
  const status = normalizeCampaignStatus(statusValue);
  if (!status) {
    throw new HttpError(400, "status is required");
  }

  return updateCampaign(id, { status });
};

export const deleteCampaign = async (id: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { _count: { select: { donations: true } }, assignment: true },
  });

  if (!campaign) {
    throw new HttpError(404, "Campaign not found");
  }

  if (campaign._count.donations > 0) {
    throw new HttpError(409, "Cannot delete a campaign with donations");
  }

  await prisma.$transaction(async (tx) => {
    if (campaign.assignment) {
      await tx.transportEvent.deleteMany({ where: { assignmentId: campaign.assignment.id } });
      await tx.transportAssignment.delete({ where: { id: campaign.assignment.id } });
    }

    await tx.campaign.delete({ where: { id } });
  });

  return { message: "Campaign deleted successfully" };
};
