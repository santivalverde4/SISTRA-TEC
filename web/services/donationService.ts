import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { CampaignStatus } from '@/types';

const log = createLogger('donationService');

// --- Backend shapes ---

type BackendDonationStatus = 'RECEIVED' | 'CLASSIFIED' | 'IN_TRANSIT' | 'DELIVERED';

interface BackendDonation {
  id: string;
  note: string | null;
  status: BackendDonationStatus;
  createdAt: string;
  campaign: { name: string; status: string };
  items: Array<{ description: string; quantity: number }>;
}

interface BackendTracking {
  donationId: string;
  campaign: string;
  currentStatus: BackendDonationStatus;
  items: Array<{ description: string; quantity: number }>;
  history: Array<{ status: string; changedAt: string; reason: string | null; changedBy: string | null }>;
}

interface BackendAvailableCampaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  categories: string[];
  donationsCount: number;
}

// --- View models ---

export interface DonationItem {
  description: string;
  quantity: number;
}

export interface Donation {
  id: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  items: DonationItem[];
  note: string | null;
  date: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'status' | 'logistic';
  status?: 'completed' | 'current' | 'pending';
}

export interface TraceableDonation extends Donation {
  timeline: TimelineEvent[];
}

export interface AvailableCampaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  categories: string[];
  donationsCount: number;
}

export interface SubmitDonationPayload {
  campaignId: string;
  items: DonationItem[];
  note?: string;
}

// --- Mappers ---

const STATUS_ORDER: BackendDonationStatus[] = ['RECEIVED', 'CLASSIFIED', 'IN_TRANSIT', 'DELIVERED'];

const STATUS_LABELS: Record<BackendDonationStatus, string> = {
  RECEIVED: 'Donación recibida',
  CLASSIFIED: 'Donación clasificada',
  IN_TRANSIT: 'En camino al destino',
  DELIVERED: 'Donación entregada',
};

function mapDonationStatus(status: BackendDonationStatus): CampaignStatus {
  switch (status) {
    case 'RECEIVED':   return 'abierta';
    case 'CLASSIFIED': return 'congelada';
    case 'IN_TRANSIT': return 'en-camino';
    case 'DELIVERED':  return 'entregada';
  }
}

function mapDonation(d: BackendDonation): Donation {
  return {
    id: d.id,
    campaignName: d.campaign.name,
    campaignStatus: mapDonationStatus(d.status),
    items: d.items,
    note: d.note,
    date: d.createdAt,
  };
}

function buildTimeline(tracking: BackendTracking): TimelineEvent[] {
  const currentIndex = STATUS_ORDER.indexOf(tracking.currentStatus);
  return STATUS_ORDER.map((s, i) => {
    const historyEntry = tracking.history.find((h) => h.status === s);
    let eventStatus: 'completed' | 'current' | 'pending';
    if (i < currentIndex)      eventStatus = 'completed';
    else if (i === currentIndex) eventStatus = 'current';
    else                        eventStatus = 'pending';

    return {
      id: String(i),
      title: STATUS_LABELS[s],
      description: historyEntry?.reason ?? '',
      date: historyEntry ? new Date(historyEntry.changedAt).toLocaleDateString('es-CR') : 'Pendiente',
      type: 'status' as const,
      status: eventStatus,
    };
  });
}

// --- Service functions ---

export async function getMyDonations(): Promise<Donation[]> {
  try {
    const data = await api.get<BackendDonation[]>('/api/donations/me');
    return data.map(mapDonation);
  } catch (err) {
    log.error('getMyDonations failed', err);
    throw err;
  }
}

export async function getDonationTracking(donationId: string): Promise<TimelineEvent[]> {
  try {
    const tracking = await api.get<BackendTracking>(`/api/donations/${donationId}/tracking`);
    return buildTimeline(tracking);
  } catch (err) {
    log.error(`getDonationTracking(${donationId}) failed`, err);
    throw err;
  }
}

export async function getAvailableCampaigns(): Promise<AvailableCampaign[]> {
  try {
    return await api.get<BackendAvailableCampaign[]>('/api/campaigns?status=abierta');
  } catch (err) {
    log.error('getAvailableCampaigns failed', err);
    throw err;
  }
}

export async function submitDonation(payload: SubmitDonationPayload): Promise<void> {
  try {
    await api.post('/api/donations', payload);
  } catch (err) {
    log.error(`submitDonation(campaign=${payload.campaignId}) failed`, err);
    throw err;
  }
}
