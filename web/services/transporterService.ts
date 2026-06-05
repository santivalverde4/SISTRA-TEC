import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { CampaignStatus } from '@/types';

const log = createLogger('transporterService');

// --- Backend shapes ---

interface BackendAssignment {
  id: string;
  destination: string;
  distanceKm: number;
  departureDate: string;
  estimatedArrival: string;
  campaign: { id: string; name: string; status: string };
}

interface BackendTransporter {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  email: string;
  assignments: BackendAssignment[];
}

interface BackendAssignedCampaign {
  id: string;
  name: string;
  status: string;
  assignment: {
    destination: string;
    distanceKm: number;
    departureDate: string;
    estimatedArrival: string;
  };
  eventsCount: number;
}

interface BackendTrackingEvent {
  id: string;
  type: string;
  description: string;
  notes: string | null;
  createdAt: string;
}

interface BackendCampaignTracking {
  id: string;
  name: string;
  status: string;
  assignment: {
    destination: string;
    distanceKm: number;
    departureDate: string;
    estimatedArrival: string;
  };
  events: BackendTrackingEvent[];
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
  phone: string;
  email: string;
  assignments: TransporterAssignment[];
}

export interface AssignedCampaign {
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
    phone: t.phone,
    email: t.email,
    assignments: t.assignments.map((a) => ({
      campaignName: a.campaign.name,
      destination: a.destination,
      km: String(a.distanceKm),
      status: a.campaign.status,
    })),
  };
}

function mapAssignedCampaign(c: BackendAssignedCampaign): AssignedCampaign {
  return {
    id: c.id,
    name: c.name,
    status: c.status as CampaignStatus,
    destination: c.assignment.destination,
    km: String(c.assignment.distanceKm),
    departureDate: c.assignment.departureDate.split('T')[0],
    estimatedArrival: c.assignment.estimatedArrival.split('T')[0],
    eventsCount: c.eventsCount,
  };
}

function mapTimeline(c: BackendCampaignTracking): TimelineEvent[] {
  return c.events.map((e) => ({
    id: e.id,
    title: e.type,
    description: e.notes ? `${e.description} — ${e.notes}` : e.description,
    date: new Date(e.createdAt).toLocaleDateString('es-CR'),
    type: 'logistic' as const,
    status: 'completed' as const,
  }));
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
    const data = await api.get<BackendAssignedCampaign[]>('/api/assignments/me');
    return data.map(mapAssignedCampaign);
  } catch (err) {
    log.error('getMyAssignedCampaigns failed', err);
    throw err;
  }
}

export async function getCampaignTracking(campaignId: string): Promise<CampaignWithTimeline> {
  try {
    const data = await api.get<BackendCampaignTracking>(`/api/assignments/${campaignId}/tracking`);
    return {
      ...mapAssignedCampaign({ ...data, eventsCount: data.events.length }),
      timeline: mapTimeline(data),
    };
  } catch (err) {
    log.error(`getCampaignTracking(${campaignId}) failed`, err);
    throw err;
  }
}

export async function registerEvent(payload: RegisterEventPayload): Promise<void> {
  try {
    await api.post(`/api/assignments/${payload.campaignId}/events`, {
      type: payload.type,
      description: payload.description,
      notes: payload.notes,
    });
  } catch (err) {
    log.error(`registerEvent(campaign=${payload.campaignId}) failed`, err);
    throw err;
  }
}

export async function markDelivered(campaignId: string): Promise<void> {
  try {
    await api.patch(`/api/campaigns/${campaignId}/status`, { status: 'DELIVERED' });
  } catch (err) {
    log.error(`markDelivered(${campaignId}) failed`, err);
    throw err;
  }
}
