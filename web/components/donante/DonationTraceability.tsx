'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Timeline } from '@/components/shared/Timeline';
import { Search, TrendingUp, Calendar, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { resolveErrorKey } from '@/lib/apiError';
import { getMyDonations, getDonationTracking, type Donation, type TimelineEvent } from '@/services/donationService';

interface TraceableDonation extends Donation {
  timeline: TimelineEvent[];
}

export const DonationTraceability = () => {
  const { t } = useT();
  const [donations, setDonations] = useState<TraceableDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<TraceableDonation | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    getMyDonations()
      .then((data) => setDonations(data.map((d) => ({ ...d, timeline: [] }))))
      .catch((err) => setError(t(resolveErrorKey(err) as Parameters<typeof t>[0])))
      .finally(() => setLoading(false));
  }, [t]);

  function handleSelect(donation: TraceableDonation) {
    setSelected(donation);
    setTrackingError(null);
    if (donation.timeline.length > 0) return;

    setTrackingLoading(true);
    getDonationTracking(donation.campaignId)
      .then((timeline) => {
        setDonations((prev) =>
          prev.map((d) => d.id === donation.id ? { ...d, timeline } : d)
        );
        setSelected((prev) => prev?.id === donation.id ? { ...prev, timeline } : prev);
      })
      .catch((err) => setTrackingError(t(resolveErrorKey(err) as Parameters<typeof t>[0])))
      .finally(() => setTrackingLoading(false));
  }

  const filtered = donations.filter((d) =>
    d.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-16 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('traceability.donation_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('traceability.donation_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list */}
        <div className="lg:col-span-1">
          <Card className="mb-4">
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('traceability.search_placeholder')}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filtered.map((donation) => (
              <Card
                key={donation.id}
                className={`cursor-pointer transition-all ${
                  selected?.id === donation.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSelect(donation)}
              >
                <CardContent>
                  <h4 className="mb-2">{donation.campaignName}</h4>
                  <StatusBadge status={donation.campaignStatus} />
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />{formatDate(donation.date)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {donation.items.length} {donation.items.length === 1 ? t('donation.item_singular') : t('donation.item_plural')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2>{selected.campaignName}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('traceability.donated_on')} {formatDate(selected.date)}</p>
                  </div>
                  <StatusBadge status={selected.campaignStatus} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-3">{t('traceability.what_you_donated')}</h4>
                  <div className="grid grid-cols-[1fr_120px] gap-2 text-sm font-medium text-muted-foreground px-1 mb-2">
                    <span>{t('donation.column_product')}</span>
                    <span>{t('donation.column_quantity')}</span>
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    {selected.items.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_120px] gap-2 text-sm px-3 py-2.5 border-b border-border last:border-b-0"
                        style={{ background: i % 2 !== 0 ? 'var(--muted)' : undefined }}
                      >
                        <span>{item.description}</span>
                        <span className="font-medium tabular-nums">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {selected.note && (
                    <p className="mt-2 text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                      {selected.note}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t('traceability.campaign_history')}
                  </h4>
                  {trackingLoading
                    ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                    : trackingError
                      ? <p className="text-sm text-destructive">{trackingError}</p>
                      : <Timeline events={selected.timeline} />
                  }
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-16">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2">{t('traceability.select_donation')}</h3>
                  <p className="text-muted-foreground">
                    {t('traceability.select_donation_hint')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
