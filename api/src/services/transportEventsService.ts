import { DonationStatus, Role, TransportEventType } from "@prisma/client";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";
import { ensureAssignmentAccess } from "./transportAssignmentsService";

const eventLabelToEnum: Record<string, TransportEventType> = {
  "Camion salio": "TRUCK_DEPARTED",
  "Cami\u00f3n sali\u00f3": "TRUCK_DEPARTED",
  "Entrega parcial": "PARTIAL_DELIVERY",
  "Ruta bloqueada": "ROUTE_BLOCKED",
  "Punto de control": "CHECKPOINT",
  "Parada tecnica": "TECHNICAL_STOP",
  "Parada t\u00e9cnica": "TECHNICAL_STOP",
  "Llegada a destino": "ARRIVED_AT_DESTINATION",
  Otro: "OTHER",
};

const eventEnumToLabel: Record<TransportEventType, string> = {
  TRUCK_DEPARTED: "Cami\u00f3n sali\u00f3",
  PARTIAL_DELIVERY: "Entrega parcial",
  ROUTE_BLOCKED: "Ruta bloqueada",
  CHECKPOINT: "Punto de control",
  TECHNICAL_STOP: "Parada t\u00e9cnica",
  ARRIVED_AT_DESTINATION: "Llegada a destino",
  OTHER: "Otro",
};

const campaignStatusToFrontend: Record<string, string> = {
  OPEN: "abierta",
  FROZEN: "congelada",
  CLOSED: "cerrada",
  IN_TRANSIT: "en-camino",
  DELIVERED: "entregada",
  FINALIZED: "finalizada",
};

const normalizeEventType = (value: unknown): TransportEventType => {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(400, "type is required");
  }

  const trimmed = value.trim();
  const upperValue = trimmed.toUpperCase() as TransportEventType;
  if (Object.values(TransportEventType).includes(upperValue)) {
    return upperValue;
  }

  const eventType = eventLabelToEnum[trimmed];
  if (!eventType) {
    throw new HttpError(400, "Invalid transport event type");
  }

  return eventType;
};

const formatEvent = (event: any) => ({
  id: event.id,
  assignmentId: event.assignmentId,
  type: event.type,
  label: eventEnumToLabel[event.type as TransportEventType],
  description: event.description,
  notes: event.notes,
  occurredAt: event.occurredAt,
});

const assignmentInclude = {
  campaign: {
    include: {
      donations: {
        include: { items: true },
      },
    },
  },
  transporter: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  events: {
    orderBy: { occurredAt: "asc" as const },
  },
};

export const listAssignmentEvents = async (assignmentId: string, userId: string, role: Role) => {
  await ensureAssignmentAccess(assignmentId, userId, role);

  const events = await prisma.transportEvent.findMany({
    where: { assignmentId },
    orderBy: { occurredAt: "asc" },
  });

  return events.map(formatEvent);
};

export const createAssignmentEvent = async (
  assignmentId: string,
  userId: string,
  role: Role,
  data: { type?: string; description?: string; notes?: string }
) => {
  await ensureAssignmentAccess(assignmentId, userId, role);

  if (!data.description?.trim()) {
    throw new HttpError(400, "description is required");
  }

  const event = await prisma.transportEvent.create({
    data: {
      assignmentId,
      type: normalizeEventType(data.type),
      description: data.description.trim(),
      notes: data.notes,
    },
  });

  await prisma.transportAssignment.update({
    where: { id: assignmentId },
    data: { campaign: { update: { status: "IN_TRANSIT" } } },
  });

  return formatEvent(event);
};

export const listEventsForTransporter = async (userId: string) => {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) {
    throw new HttpError(404, "Transporter profile not found");
  }

  const events = await prisma.transportEvent.findMany({
    where: { assignment: { transporterId: transporter.id } },
    include: {
      assignment: {
        include: { campaign: true },
      },
    },
    orderBy: { occurredAt: "desc" },
  });

  return events.map((event) => ({
    ...formatEvent(event),
    campaignId: event.assignment.campaignId,
    campaignName: event.assignment.campaign.name,
  }));
};

export const getAssignmentTraceability = async (assignmentId: string, userId: string, role: Role) => {
  await ensureAssignmentAccess(assignmentId, userId, role);

  const assignment = await prisma.transportAssignment.findUnique({
    where: { id: assignmentId },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw new HttpError(404, "Transport assignment not found");
  }

  const timeline = [
    {
      id: `${assignment.id}-closed`,
      title: "Campa\u00f1a cerrada para donaciones",
      description: "Donaciones listas para transporte",
      date: assignment.campaign.endDate,
      type: "status",
      status: "completed",
    },
    ...assignment.events.map((event) => ({
      id: event.id,
      title: eventEnumToLabel[event.type],
      description: [event.description, event.notes].filter(Boolean).join(" - "),
      date: event.occurredAt,
      type: "logistic",
      status: "completed",
    })),
    ...(["DELIVERED", "FINALIZED"].includes(assignment.campaign.status)
      ? [
          {
            id: `${assignment.id}-delivered`,
            title: "Campa\u00f1a entregada",
            description: "Proceso completado exitosamente",
            date: assignment.updatedAt,
            type: "status",
            status: "completed",
          },
        ]
      : [
          {
            id: `${assignment.id}-estimated`,
            title: "Llegada estimada",
            description: `Entrega programada en ${assignment.destination}`,
            date: assignment.estimatedArrival,
            type: "status",
            status: "pending",
          },
        ]),
    ...(assignment.campaign.status === "FINALIZED"
      ? [
          {
            id: `${assignment.id}-finalized`,
            title: "Campa\u00f1a finalizada",
            description: "Proceso administrativo completado",
            date: assignment.campaign.updatedAt,
            type: "status",
            status: "completed",
          },
        ]
      : []),
  ];

  return {
    campaign: {
      id: assignment.campaign.id,
      name: assignment.campaign.name,
      description: assignment.campaign.description,
      status: campaignStatusToFrontend[assignment.campaign.status] ?? assignment.campaign.status,
      rawStatus: assignment.campaign.status,
      categories: assignment.campaign.categories,
      donationsCount: assignment.campaign.donations.length,
    },
    assignment: {
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
    },
    events: assignment.events.map(formatEvent),
    timeline,
  };
};

export const getTraceabilityByCampaignId = async (campaignId: string) => {
  const assignment = await prisma.transportAssignment.findFirst({
    where: { campaignId },
    include: assignmentInclude,
  });

  if (!assignment) {
    return { timeline: [] };
  }

  const timeline = [
    {
      id: `${assignment.id}-closed`,
      title: "Campa\u00f1a cerrada para donaciones",
      description: "Donaciones listas para transporte",
      date: assignment.campaign.endDate,
      type: "status",
      status: "completed",
    },
    ...assignment.events.map((event) => ({
      id: event.id,
      title: eventEnumToLabel[event.type],
      description: [event.description, event.notes].filter(Boolean).join(" - "),
      date: event.occurredAt,
      type: "logistic",
      status: "completed",
    })),
    ...(["DELIVERED", "FINALIZED"].includes(assignment.campaign.status)
      ? [
          {
            id: `${assignment.id}-delivered`,
            title: "Campa\u00f1a entregada",
            description: "Proceso completado exitosamente",
            date: assignment.updatedAt,
            type: "status",
            status: "completed",
          },
        ]
      : [
          {
            id: `${assignment.id}-estimated`,
            title: "Llegada estimada",
            description: `Entrega programada en ${assignment.destination}`,
            date: assignment.estimatedArrival,
            type: "status",
            status: "pending",
          },
        ]),
    ...(assignment.campaign.status === "FINALIZED"
      ? [
          {
            id: `${assignment.id}-finalized`,
            title: "Campa\u00f1a finalizada",
            description: "Proceso administrativo completado",
            date: assignment.campaign.updatedAt,
            type: "status",
            status: "completed",
          },
        ]
      : []),
  ];

  return { timeline };
};

export const deliverAssignment = async (assignmentId: string, userId: string, role: Role) => {
  await ensureAssignmentAccess(assignmentId, userId, role);

  const assignment = await prisma.transportAssignment.findUnique({
    where: { id: assignmentId },
    include: { campaign: { include: { donations: true } } },
  });

  if (!assignment) {
    throw new HttpError(404, "Transport assignment not found");
  }

  const updatedAssignment = await prisma.$transaction(async (tx) => {
    await tx.transportEvent.create({
      data: {
        assignmentId,
        type: "ARRIVED_AT_DESTINATION",
        description: "Entrega completa en destino",
        notes: "Campaign delivered",
      },
    });

    await tx.campaign.update({
      where: { id: assignment.campaignId },
      data: { status: "DELIVERED" },
    });

    const deliverableStatuses: DonationStatus[] = ["RECEIVED", "CLASSIFIED", "IN_TRANSIT"];
    const donationsToDeliver = assignment.campaign.donations.filter((donation) =>
      deliverableStatuses.includes(donation.status)
    );

    for (const donation of donationsToDeliver) {
      await tx.donation.update({
        where: { id: donation.id },
        data: { status: "DELIVERED" },
      });
      await tx.donationHistory.create({
        data: {
          donationId: donation.id,
          status: "DELIVERED",
          reason: "Donation delivered with campaign transport assignment",
          changedBy: userId,
        },
      });
    }

    return tx.transportAssignment.findUnique({
      where: { id: assignmentId },
      include: assignmentInclude,
    });
  });

  return updatedAssignment;
};
