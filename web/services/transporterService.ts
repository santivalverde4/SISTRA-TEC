import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { CampaignStatus } from '@/types';

const log = createLogger('transporterService');

// --- Backend shapes ---

interface BackendAssignment {
  id: string;
  campaignName: string;
  destination: string;
  distanceKm: number;
  km: string;
  status: string;
  departureDate: string;
  estimatedArrival: string;
}

interface BackendTransporter {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  email: string;
  assignments: BackendAssignment[];
}

interface BackendAssignedCampaign {
  assignmentId: string;
  id: string;
  campaignId: string;
  name: string;
  status: string;
  rawStatus: string;
  destination: string;
  km: string;
  distanceKm: number;
  departureDate: string;
  estimatedArrival: string;
  eventsCount: number;
}

interface BackendTimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  status: string;
}

interface BackendTrackingEvent {
  id: string;
  assignmentId: string;
  type: string;
  label: string;
  description: string;
  notes: string | null;
  occurredAt: string;
}

interface BackendCampaignTracking {
  campaign: {
    id: string;
    name: string;
    description: string;
    status: string;
    rawStatus: string;
    categories: string[];
    donationsCount: number;
  };
  assignment: {
    id: string;
    transporterId: string;
    destination: string;
    distanceKm: number;
    km: string;
    departureDate: string;
    estimatedArrival: string;
  };
  events: BackendTrackingEvent[];
  timeline: BackendTimelineEvent[];
}

// --- View models ---

export interface TransporterAssignment {
  campaignName: string;
  destination: string;
  km: string;
  status: string;
}

export interface Transporter {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  email: string;
  assignments: TransporterAssignment[];
}

export interface AssignedCampaign {
  assignmentId: string;
  id: string;
  name: string;
  status: CampaignStatus;
  destination: string;
  km: string;
  departureDate: string;
  estimatedArrival: string;
  eventsCount: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'status' | 'logistic';
  status?: 'completed' | 'current' | 'pending';
}

export interface CampaignWithTimeline extends AssignedCampaign {
  timeline: TimelineEvent[];
}

export interface RegisterEventPayload {
  campaignId: string;
  type: string;
  description: string;
  notes?: string;
}

// --- Mappers ---

function mapTransporter(t: BackendTransporter): Transporter {
  return {
    id: t.id,
    name: t.name,
    vehicle: t.vehicle,
    plate: t.plate,
    email: t.email,
    assignments: t.assignments.map((a) => ({
      campaignName: a.campaignName,
      destination: a.destination,
      km: a.km ?? String(a.distanceKm),
      status: a.status,
    })),
  };
}

function mapAssignedCampaign(c: BackendAssignedCampaign): AssignedCampaign {
  return {
    assignmentId: c.assignmentId,
    id: c.campaignId ?? c.id,
    name: c.name,
    status: c.status as CampaignStatus,
    destination: c.destination,
    km: c.km ?? String(c.distanceKm),
    departureDate: typeof c.departureDate === 'string' ? c.departureDate.split('T')[0] : c.departureDate,
    estimatedArrival: typeof c.estimatedArrival === 'string' ? c.estimatedArrival.split('T')[0] : c.estimatedArrival,
    eventsCount: c.eventsCount,
  };
}

// --- Service functions ---

export async function getTransporters(): Promise<Transporter[]> {
  try {
    const data = await api.get<BackendTransporter[]>('/api/transporters');
    return data.map(mapTransporter);
  } catch (err) {
    log.error('getTransporters failed', err);
    throw err;
  }
}

export async function getMyAssignedCampaigns(): Promise<AssignedCampaign[]> {
  try {
    const data = await api.get<BackendAssignedCampaign[]>('/api/transporters/me/assignments');
    return data.map(mapAssignedCampaign);
  } catch (err) {
    log.error('getMyAssignedCampaigns failed', err);
    throw err;
  }
}

export async function getCampaignTracking(assignmentId: string): Promise<CampaignWithTimeline> {
  try {
    const data = await api.get<BackendCampaignTracking>(`/api/transport-assignments/${assignmentId}/traceability`);
    const base: AssignedCampaign = {
      assignmentId: data.assignment.id,
      id: data.campaign.id,
      name: data.campaign.name,
      status: data.campaign.status as CampaignStatus,
      destination: data.assignment.destination,
      km: data.assignment.km ?? String(data.assignment.distanceKm),
      departureDate: typeof data.assignment.departureDate === 'string'
        ? data.assignment.departureDate.split('T')[0]
        : data.assignment.departureDate,
      estimatedArrival: typeof data.assignment.estimatedArrival === 'string'
        ? data.assignment.estimatedArrival.split('T')[0]
        : data.assignment.estimatedArrival,
      eventsCount: data.events.length,
    };
    return {
      ...base,
      timeline: data.timeline.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: typeof e.date === 'string' ? new Date(e.date).toLocaleDateString('es-CR') : String(e.date),
        type: e.type as 'status' | 'logistic',
        status: e.status as 'completed' | 'current' | 'pending',
      })),
    };
  } catch (err) {
    log.error(`getCampaignTracking(${assignmentId}) failed`, err);
    throw err;
  }
}

export async function registerEvent(payload: RegisterEventPayload): Promise<void> {
  try {
    await api.post(`/api/transport-assignments/${payload.campaignId}/events`, {
      type: payload.type,
      description: payload.description,
      notes: payload.notes,
    });
  } catch (err) {
    log.error(`registerEvent(assignment=${payload.campaignId}) failed`, err);
    throw err;
  }
}

export async function markDelivered(assignmentId: string): Promise<void> {
  try {
    await api.patch(`/api/transport-assignments/${assignmentId}/deliver`);
  } catch (err) {
    log.error(`markDelivered(${assignmentId}) failed`, err);
    throw err;
  }
}
