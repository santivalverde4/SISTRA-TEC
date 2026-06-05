'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { ListCard } from '@/components/shared/ListCard';
import { DetailHeader, DetailGrid, DetailField } from '@/components/shared/DetailPanel';
import { Search, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CampaignStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { api } from '@/lib/api';

const PAGE_SIZE = 8;

interface DonationItem {
  description: string;
  quantity: number;
}

interface Donation {
  id: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  items: DonationItem[];
  note: string | null;
  date: string;
}

type BackendDonationStatus = 'RECEIVED' | 'CLASSIFIED' | 'IN_TRANSIT' | 'DELIVERED';

interface BackendDonation {
  id: string;
  note: string | null;
  status: BackendDonationStatus;
  createdAt: string;
  campaign: { name: string; status: string };
  items: Array<{ description: string; quantity: number }>;
}

function mapDonationStatus(status: BackendDonationStatus): CampaignStatus {
  switch (status) {
    case 'RECEIVED': return 'abierta';
    case 'CLASSIFIED': return 'congelada';
    case 'IN_TRANSIT': return 'en-camino';
    case 'DELIVERED': return 'entregada';
  }
}

function toViewModel(d: BackendDonation): Donation {
  return {
    id: d.id,
    campaignName: d.campaign.name,
    campaignStatus: mapDonationStatus(d.status),
    items: d.items,
    note: d.note,
    date: d.createdAt,
  };
}

export const MyDonations = () => {
  const { t } = useT();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [detailsDonation, setDetailsDonation] = useState<Donation | null>(null);

  useEffect(() => {
    api.get<BackendDonation[]>('/api/donations/me')
      .then((data) => setDonations(data.map(toViewModel)))
      .catch(() => setError(t('errors.load_failed')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { setPage(1); }, [searchTerm]);

  const filtered = donations.filter((d) =>
    d.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-16 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1>{t('donation.my_donations_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('donation.my_donations_subtitle')}</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('donation.search_placeholder')}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {paginated.map((donation) => (
          <ListCard
            key={donation.id}
            icon={<Package className="w-6 h-6 text-primary" />}
            title={donation.campaignName}
            badge={<StatusBadge status={donation.campaignStatus} />}
            meta={
              <>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {donation.items.length} {donation.items.length === 1 ? t('donation.item_singular') : t('donation.item_plural')}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(donation.date)}
                </span>
              </>
            }
            action={{ label: t('campaign.view_details'), onClick: () => setDetailsDonation(donation) }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('donation.no_donations')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {detailsDonation && (
        <Modal title={t('donation.detail_title')} onClose={() => setDetailsDonation(null)}>
          <div className="space-y-4">
            <DetailHeader
              icon={<Package className="w-7 h-7 text-primary" />}
              title={detailsDonation.campaignName}
              subtitle={formatDate(detailsDonation.date)}
            />

            <DetailGrid>
              <DetailField label={t('donation.date_label')} value={formatDate(detailsDonation.date)} />
              <DetailField label={t('donation.campaign_status')} value={<StatusBadge status={detailsDonation.campaignStatus} />} />
            </DetailGrid>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{t('donation.items_donated')}</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2 bg-secondary/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>{t('donation.column_product')}</span>
                  <span>{t('donation.column_quantity')}</span>
                </div>
                {detailsDonation.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2.5 text-sm border-t border-border">
                    <span>{item.description}</span>
                    <span className="text-muted-foreground whitespace-nowrap">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {detailsDonation.note && (
              <DetailField
                label={t('donation.note')}
                value={<span className="block bg-secondary/50 rounded-lg px-3 py-2 text-sm">{detailsDonation.note}</span>}
              />
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailsDonation(null)}>{t('common.close')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
