'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Modal } from '@/components/shared/Modal';
import { ListCard } from '@/components/shared/ListCard';
import { DetailHeader, DetailGrid, DetailField } from '@/components/shared/DetailPanel';
import { Search, Truck, MapPin, Package, Phone, Mail } from 'lucide-react';
import { useT } from '@/lib/i18n/useT';

interface Assignment {
  campaignName: string;
  destination: string;
  km: string;
  status: 'pendiente' | 'en-camino' | 'entregada' | 'finalizada';
}

interface Transportista {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  email: string;
  assignments: Assignment[];
}

const mockTransportistas: Transportista[] = [
  {
    id: 't1',
    name: 'Carlos Méndez',
    vehicle: 'Camión 3.5t',
    plate: 'ABC-1234',
    phone: '+506 8800-0001',
    email: 'carlos.mendez@sistra.com',
    assignments: [
      {
        campaignName: 'Ropa de invierno para refugiados',
        destination: 'Comunidad San Juan, Zona Norte',
        km: '120',
        status: 'en-camino',
      },
    ],
  },
  {
    id: 't2',
    name: 'Laura Soto',
    vehicle: 'Furgoneta',
    plate: 'DEF-5678',
    phone: '+506 8800-0002',
    email: 'laura.soto@sistra.com',
    assignments: [
      {
        campaignName: 'Medicamentos para zonas rurales',
        destination: 'Centro de Salud Rural, Zona Sur',
        km: '85',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 't3',
    name: 'Roberto Díaz',
    vehicle: 'Camión 7t',
    plate: 'GHI-9012',
    phone: '+506 8800-0003',
    email: 'roberto.diaz@sistra.com',
    assignments: [],
  },
  {
    id: 't4',
    name: 'Ana Flores',
    vehicle: 'Pickup',
    plate: 'JKL-3456',
    phone: '+506 8800-0004',
    email: 'ana.flores@sistra.com',
    assignments: [
      {
        campaignName: 'Ayuda para comunidades afectadas por inundaciones',
        destination: 'Aldea Río Verde',
        km: '45',
        status: 'finalizada',
      },
    ],
  },
];

const statusLabel: Record<string, { label: string; classes: string }> = {
  'pendiente': { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700' },
  'en-camino': { label: 'En camino', classes: 'bg-purple-100 text-purple-700' },
  'entregada': { label: 'Entregada', classes: 'bg-green-100 text-green-700' },
  'finalizada': { label: 'Finalizada', classes: 'bg-gray-100 text-gray-600' },
};

export const Transportistas = () => {
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Transportista | null>(null);

  const filtered = mockTransportistas.filter(tr =>
    tr.name.toLowerCase().includes(search.toLowerCase()) ||
    tr.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('transporters.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('transporters.subtitle')}</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('transporters.search_placeholder')}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((tr) => (
          <ListCard
            key={tr.id}
            icon={<Truck className="w-6 h-6 text-primary" />}
            title={tr.name}
            badge={
              tr.assignments.length === 0 ? (
                <span className="text-sm text-muted-foreground">{t('transporters.no_active_assignments')}</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tr.assignments.map((a, i) => {
                    const s = statusLabel[a.status];
                    return (
                      <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${s.classes}`}>
                        {a.campaignName}
                      </span>
                    );
                  })}
                </div>
              )
            }
            meta={
              <>
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />{tr.vehicle} · {tr.plate}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{tr.phone}</span>
                <span className="flex items-center gap-1 truncate"><Mail className="w-3.5 h-3.5 shrink-0" />{tr.email}</span>
              </>
            }
            action={{ label: t('campaign.view_details'), onClick: () => setSelected(tr) }}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('transporters.no_transporters')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selected && (
        <Modal title={t('transporters.detail_title')} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <DetailHeader
              icon={<Truck className="w-7 h-7 text-primary" />}
              title={selected.name}
              subtitle={`${selected.vehicle} · ${selected.plate}`}
            />

            <DetailGrid>
              <DetailField label={t('transporters.phone')} value={selected.phone} />
              <DetailField label={t('transporters.email')} value={<span className="truncate block">{selected.email}</span>} />
              <DetailField label={t('transporters.vehicle')} value={selected.vehicle} />
              <DetailField label={t('transporters.plate')} value={selected.plate} />
            </DetailGrid>

            {selected.assignments.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{t('transporters.assignments')}</p>
                <div className="space-y-3">
                  {selected.assignments.map((a, i) => {
                    const s = statusLabel[a.status];
                    return (
                      <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium flex-1">{a.campaignName}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap shrink-0 ${s.classes}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" /> {a.destination}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 shrink-0" /> {a.km} {t('transporters.km_traveled')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t('transporters.no_assignments')}</p>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelected(null)}>{t('common.close')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
