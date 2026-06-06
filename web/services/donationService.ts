import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { CampaignStatus } from '@/types';

const log = createLogger('donationService');

// --- Backend shapes ---

type BackendDonationStatus = 'RECEIVED' | 'CLASSIFIED' | 'IN_TRANSIT' | 'DELIVERED';

interface BackendDonation {
  id: string;
  campaignId: string;
  note: string | null;
  status: BackendDonationStatus;
  createdAt: string;
  campaign: { name: string; status: string };
  items: Array<{ description: string; quantity: number }>;
}

interface BackendCampaignTraceability {
  timeline: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    type: string;
    status: string;
  }>;
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
  campaignId: string;
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

const CAMPAIGN_STATUS_MAP: Record<string, CampaignStatus> = {
  OPEN:       'abierta',
  FROZEN:     'congelada',
  CLOSED:     'cerrada',
  IN_TRANSIT: 'en-camino',
  DELIVERED:  'entregada',
  FINALIZED:  'finalizada',
};

function mapDonation(d: BackendDonation): Donation {
  return {
    id: d.id,
    campaignId: d.campaignId,
    campaignName: d.campaign.name,
    campaignStatus: CAMPAIGN_STATUS_MAP[d.campaign.status] ?? 'cerrada',
    items: d.items,
    note: d.note,
    date: d.createdAt,
  };
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

export async function getDonationTracking(campaignId: string): Promise<TimelineEvent[]> {
  try {
    const data = await api.get<BackendCampaignTraceability>(`/api/campaigns/${campaignId}/traceability`);
    return data.timeline.map((e, i) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      date: typeof e.date === 'string' ? new Date(e.date).toLocaleDateString('es-CR') : String(e.date),
      type: e.type as 'status' | 'logistic',
      status: e.status as 'completed' | 'current' | 'pending',
    }));
  } catch (err) {
    log.error(`getDonationTracking(campaign=${campaignId}) failed`, err);
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
