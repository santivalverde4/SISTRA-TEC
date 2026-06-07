import type { CampaignStatus } from '@/types';
import type { Campaign } from '@/services/campaignService';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  abierta: 'campaign.status_open',
  congelada: 'campaign.status_frozen',
  cerrada: 'campaign.status_closed',
  'en-camino': 'campaign.status_in_transit',
  entregada: 'campaign.status_delivered',
  finalizada: 'campaign.status_finalized',
};

/**
 * Returns the set of statuses an admin may manually transition a campaign to,
 * given its current state and contextual data.
 *
 * Rules:
 * - abierta   → congelada always; auto-closes when past end date (handled by backend)
 * - congelada → abierta/cerrada if within date range; cerrada only if past date range
 * - cerrada   → abierta if within date range; en-camino only if a transporter is assigned
 * - en-camino → no transitions (locked once dispatched)
 * - entregada → finalizada (admin finalizes after transporter marks delivered)
 * - finalizada→ immutable
 */
export function getAllowedTransitions(
  campaign: Campaign,
  today: string,
): CampaignStatus[] {
  const { status, startDate, endDate } = campaign;
  const beforeEndDate = today <= endDate.slice(0, 10);

  switch (status) {
    case 'abierta':
      return ['congelada'];

    case 'congelada':
      return beforeEndDate ? ['abierta', 'cerrada'] : ['cerrada'];

    case 'cerrada': {
      const hasTransporter = !!campaign.assignment;
      const inTransit: CampaignStatus[] = hasTransporter ? ['en-camino'] : [];
      return beforeEndDate ? ['abierta', ...inTransit] : inTransit;
    }

    // Locked once in transit
    case 'en-camino':
      return [];

    // Admin finalizes after transporter marks entregada
    case 'entregada':
      return ['finalizada'];

    case 'finalizada':
      return [];

    default:
      return [];
  }
}

/**
 * Returns true if the admin may edit this campaign.
 * Finalized campaigns are immutable.
 */
export function canEditCampaign(campaign: Campaign): boolean {
  return campaign.status !== 'finalizada';
}

/**
 * Returns true if the admin may assign a transporter to this campaign.
 * Transporter assignment is only allowed when status is 'cerrada'.
 */
export function canAssignTransporter(campaign: Campaign): boolean {
  return campaign.status === 'cerrada';
}

const LOCKED_STATUSES: CampaignStatus[] = ['en-camino', 'entregada', 'finalizada'];

/**
 * Returns true if the admin may delete this campaign.
 * Cannot delete if it has donations or is past the 'cerrada' state.
 */
export function canDeleteCampaign(campaign: Campaign): boolean {
  return campaign.donationsCount === 0 && !LOCKED_STATUSES.includes(campaign.status);
}
