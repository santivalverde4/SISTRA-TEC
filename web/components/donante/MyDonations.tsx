'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { ListCard } from '@/components/shared/ListCard';
import { DetailHeader, DetailGrid, DetailField } from '@/components/shared/DetailPanel';
import { Search, Package, Calendar } from 'lucide-react';
import type { CampaignStatus } from '@/types';

interface DonationItem {
  description: string;
  quantity: string;
}

interface Donation {
  id: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  items: DonationItem[];
  note: string;
  date: string;
}

const mockDonations: Donation[] = [
  {
    id: '1',
    campaignName: 'Ayuda para comunidades afectadas por inundaciones',
    campaignStatus: 'abierta',
    items: [
      { description: 'Arroz', quantity: '10 kg' },
      { description: 'Frijoles', quantity: '5 kg' },
      { description: 'Aceite', quantity: '3 litros' },
    ],
    note: 'Productos en buen estado, empacados.',
    date: '2026-05-08',
  },
  {
    id: '2',
    campaignName: 'Ropa de invierno para refugiados',
    campaignStatus: 'en-camino',
    items: [
      { description: 'Chaquetas talla M', quantity: '8 prendas' },
      { description: 'Suéteres talla L', quantity: '7 prendas' },
    ],
    note: '',
    date: '2026-05-09',
  },
];

export const MyDonations = () => {
  const [donations] = useState<Donation[]>(mockDonations);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDonation, setDetailsDonation] = useState<Donation | null>(null);

  const filteredDonations = donations.filter((d) =>
    d.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>Mis Donaciones</h1>
        <p className="text-muted-foreground mt-1">
          Historial de tus donaciones realizadas
        </p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de campaña..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <ListCard
            key={donation.id}
            icon={<Package className="w-6 h-6 text-primary" />}
            title={donation.campaignName}
            badge={<StatusBadge status={donation.campaignStatus} />}
            meta={
              <>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {donation.items.length} {donation.items.length === 1 ? 'artículo' : 'artículos'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {donation.date}
                </span>
              </>
            }
            action={{ label: 'Ver detalles', onClick: () => setDetailsDonation(donation) }}
          />
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes donaciones registradas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {detailsDonation && (
        <Modal title="Detalle de Donación" onClose={() => setDetailsDonation(null)}>
          <div className="space-y-4">
            <DetailHeader
              icon={<Package className="w-7 h-7 text-primary" />}
              title={detailsDonation.campaignName}
              subtitle={detailsDonation.date}
            />

            <DetailGrid>
              <DetailField label="Fecha" value={detailsDonation.date} />
              <DetailField label="Estado campaña" value={<StatusBadge status={detailsDonation.campaignStatus} />} />
            </DetailGrid>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Artículos donados</p>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] gap-4 px-3 py-2 bg-secondary/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>Producto</span>
                  <span>Cantidad</span>
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
                label="Nota"
                value={<span className="block bg-secondary/50 rounded-lg px-3 py-2 text-sm">{detailsDonation.note}</span>}
              />
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailsDonation(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
