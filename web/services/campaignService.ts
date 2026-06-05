import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import type { CampaignStatus } from '@/types';

const log = createLogger('campaignService');

// --- Backend shapes ---

export interface BackendTransporter {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  email: string;
}

export interface BackendAssignment {
  id: string;
  transporterId: string;
  transporter: BackendTransporter;
  destination: string;
  distanceKm: number;
  departureDate: string;
  estimatedArrival: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  categories: string[];
  donationsCount: number;
  assignment?: BackendAssignment;
}

export interface CreateCampaignPayload {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  categories: string[];
}

export interface UpdateCampaignPayload {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  categories: string[];
}

export interface AssignTransporterPayload {
  transporterId: string;
  destination: string;
  distanceKm: number;
  departureDate: string;
  estimatedArrival: string;
}

export async function getCampaigns(): Promise<Campaign[]> {
  try {
    return await api.get<Campaign[]>('/api/campaigns');
  } catch (err) {
    log.error('getCampaigns failed', err);
    throw err;
  }
}

export async function getTransporters(): Promise<BackendTransporter[]> {
  try {
    return await api.get<BackendTransporter[]>('/api/transporters');
  } catch (err) {
    log.error('getTransporters failed', err);
    throw err;
  }
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<Campaign> {
  try {
    return await api.post<Campaign>('/api/campaigns', payload);
  } catch (err) {
    log.error('createCampaign failed', err);
    throw err;
  }
}

export async function updateCampaign(id: string, payload: UpdateCampaignPayload): Promise<Campaign> {
  try {
    return await api.put<Campaign>(`/api/campaigns/${id}`, payload);
  } catch (err) {
    log.error(`updateCampaign(${id}) failed`, err);
    throw err;
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await api.delete(`/api/campaigns/${id}`);
  } catch (err) {
    log.error(`deleteCampaign(${id}) failed`, err);
    throw err;
  }
}

export async function assignTransporter(campaignId: string, payload: AssignTransporterPayload): Promise<void> {
  try {
    await api.post(`/api/campaigns/${campaignId}/assignment`, payload);
  } catch (err) {
    log.error(`assignTransporter(${campaignId}) failed`, err);
    throw err;
  }
}
