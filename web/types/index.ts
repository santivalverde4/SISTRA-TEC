export type UserRole = 'donante' | 'transportista' | 'administrador';

export type CampaignStatus =
  | 'abierta'
  | 'congelada'
  | 'cerrada'
  | 'en-camino'
  | 'entregada'
  | 'finalizada';

export type TransportStatus = 'pendiente' | 'en-camino' | 'entregada' | 'finalizada';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  banner?: string;
}

export interface DonationItem {
  description: string;
  quantity: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  items: DonationItem[];
  note: string;
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

export interface AssignedCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  destination: string;
  km: string;
  departureDate: string;
  estimatedArrival: string;
  eventsCount: number;
  timeline: TimelineEvent[];
}

export interface LogisticEvent {
  id: string;
  campaignName: string;
  eventType: string;
  description: string;
  notes: string;
  date: string;
  time: string;
}

export interface Transportista {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  email: string;
  assignments: TransportAssignment[];
}

export interface TransportAssignment {
  campaignName: string;
  destination: string;
  km: string;
  status: TransportStatus;
}
