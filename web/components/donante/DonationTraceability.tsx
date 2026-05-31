'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Timeline } from '@/components/shared/Timeline';
import { Search, TrendingUp, Calendar, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface DonationItem {
  description: string;
  quantity: string;
}

type CampaignStatus = 'abierta' | 'congelada' | 'cerrada' | 'en-camino' | 'entregada' | 'finalizada';

interface TraceableDonation {
  id: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  date: string;
  items: DonationItem[];
  note: string;
  timeline: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'status' | 'logistic';
    status?: 'completed' | 'current' | 'pending';
  }>;
}

const mockDonations: TraceableDonation[] = [
  {
    id: '1',
    campaignName: 'Ayuda para comunidades afectadas por inundaciones',
    campaignStatus: 'abierta',
    date: '2026-05-08',
    items: [
      { description: 'Arroz', quantity: '10 kg' },
      { description: 'Frijoles', quantity: '5 kg' },
      { description: 'Aceite', quantity: '3 litros' },
    ],
    note: 'Productos en buen estado, empacados.',
    timeline: [
      {
        id: '1',
        title: 'Donación registrada',
        description: 'Tu donación fue recibida por la campaña',
        date: '2026-05-08',
        type: 'status',
        status: 'completed',
      },
      {
        id: '2',
        title: 'En período de recolección',
        description: 'La campaña sigue abierta y recolectando donaciones',
        date: '2026-05-08',
        type: 'status',
        status: 'current',
      },
      {
        id: '3',
        title: 'Cierre y preparación de envío',
        description: 'Pendiente de que la campaña cierre',
        date: 'Próximamente',
        type: 'status',
        status: 'pending',
      },
    ],
  },
  {
    id: '2',
    campaignName: 'Ropa de invierno para refugiados',
    campaignStatus: 'en-camino',
    date: '2026-05-09',
    items: [
      { description: 'Chaquetas talla M', quantity: '8 prendas' },
      { description: 'Suéteres talla L', quantity: '7 prendas' },
    ],
    note: '',
    timeline: [
      {
        id: '1',
        title: 'Donación registrada',
        description: 'Tu donación fue recibida por la campaña',
        date: '2026-05-09',
        type: 'status',
        status: 'completed',
      },
      {
        id: '2',
        title: 'Campaña cerrada para nuevas donaciones',
        description: 'Se completó el período de recolección',
        date: '2026-05-10',
        type: 'status',
        status: 'completed',
      },
      {
        id: '3',
        title: 'Donaciones empacadas y listas',
        description: 'Transportista asignado y ruta confirmada',
        date: '2026-05-11',
        type: 'logistic',
        status: 'completed',
      },
      {
        id: '4',
        title: 'En camino al destino',
        description: 'El transporte está en ruta hacia los refugiados',
        date: '2026-05-12',
        type: 'status',
        status: 'current',
      },
      {
        id: '5',
        title: 'Entrega programada',
        description: 'Llegada estimada al punto de entrega',
        date: '2026-05-15',
        type: 'status',
        status: 'pending',
      },
    ],
  },
];

export const DonationTraceability = () => {
  const { t } = useT();
  const [donations] = useState<TraceableDonation[]>(mockDonations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<TraceableDonation | null>(null);

  const filtered = donations.filter((d) =>
    d.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                onClick={() => setSelected(donation)}
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
                        className={`grid grid-cols-[1fr_120px] gap-2 text-sm px-3 py-2.5 ${
                          i < selected.items.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <span>{item.description}</span>
                        <span className="text-muted-foreground">{item.quantity}</span>
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
                  <Timeline events={selected.timeline} />
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
