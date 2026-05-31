'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { MapPin, CheckCircle, Calendar, Truck, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface AssignedCampaign {
  id: string;
  name: string;
  status: 'cerrada' | 'en-camino' | 'entregada';
  destination: string;
  km: string;
  departureDate: string;
  estimatedArrival: string;
  eventsCount: number;
}

const eventTypes = [
  'Camión salió',
  'Entrega parcial',
  'Ruta bloqueada',
  'Punto de control',
  'Parada técnica',
  'Llegada a destino',
  'Otro',
];

const initialCampaigns: AssignedCampaign[] = [
  {
    id: '1',
    name: 'Ropa de invierno para refugiados',
    status: 'en-camino',
    destination: 'Comunidad San Juan, Zona Norte',
    km: '120',
    departureDate: '2026-05-12',
    estimatedArrival: '2026-05-15',
    eventsCount: 3,
  },
  {
    id: '2',
    name: 'Medicamentos para zonas rurales',
    status: 'cerrada',
    destination: 'Centro de Salud Rural, Zona Sur',
    km: '85',
    departureDate: '2026-05-18',
    estimatedArrival: '2026-05-20',
    eventsCount: 0,
  },
  {
    id: '3',
    name: 'Útiles escolares para primarias',
    status: 'entregada',
    destination: 'Escuela Rural San Marcos',
    km: '60',
    departureDate: '2026-04-05',
    estimatedArrival: '2026-04-07',
    eventsCount: 4,
  },
];

type FilterStatus = 'all' | 'cerrada' | 'en-camino' | 'entregada';

export const AssignedCampaigns = () => {
  const router = useRouter();
  const { t } = useT();
  const [campaigns, setCampaigns] = useState<AssignedCampaign[]>(initialCampaigns);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [eventTarget, setEventTarget] = useState<AssignedCampaign | null>(null);
  const [eventForm, setEventForm] = useState({ type: 'Camión salió', description: '', notes: '' });
  const [delivered, setDelivered] = useState(false);

  const openEventModal = (c: AssignedCampaign) => {
    setEventTarget(c);
    setEventForm({ type: 'Camión salió', description: '', notes: '' });
    setDelivered(false);
  };

  const submitEvent = () => {
    if (!eventTarget || !eventForm.description) return;
    setCampaigns(prev => prev.map(c =>
      c.id === eventTarget.id ? { ...c, eventsCount: c.eventsCount + 1 } : c
    ));
    setDelivered(false);
    setEventTarget(null);
  };

  const markDelivered = () => {
    if (!eventTarget) return;
    setCampaigns(prev => prev.map(c =>
      c.id === eventTarget.id ? { ...c, status: 'entregada' } : c
    ));
    setDelivered(true);
  };

  const filtered = campaigns.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('transporter.assigned_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('transporter.assigned_subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: 'all', label: t('transporter.filter_all') },
          { value: 'cerrada', label: t('transporter.filter_pending') },
          { value: 'en-camino', label: t('transporter.filter_in_transit') },
          { value: 'entregada', label: t('transporter.filter_delivered') },
        ] as { value: FilterStatus; label: string }[]).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              filter === opt.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-foreground hover:border-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h3>{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{campaign.destination}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-foreground font-medium">{formatDate(campaign.departureDate)}</span>
                  <span>→</span>
                  <span className="text-foreground font-medium">{formatDate(campaign.estimatedArrival)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  {campaign.km} km
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {campaign.eventsCount} {campaign.eventsCount === 1 ? t('transporter.event_singular') : t('transporter.event_plural')}
                </span>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'en-camino' && (
                  <Button onClick={() => openEventModal(campaign)}>
                    {t('transporter.register_event')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => router.push('/dashboard/transportista/traceability')}>
                  {t('transporter.view_traceability')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {eventTarget && (
        <Modal title={`${t('transporter.register_event')} — ${eventTarget.name}`} onClose={() => setEventTarget(null)}>
          {delivered ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="font-semibold text-lg">{t('transporter.delivered_modal_title')}</h3>
              <p className="text-muted-foreground text-sm">{t('transporter.delivered_modal_message')}</p>
              <Button onClick={() => setEventTarget(null)}>{t('common.close')}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">{t('transporter.event_type_label')}</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {eventTypes.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">{t('transporter.event_description_label')}</label>
                <Input
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder={t('transporter.select_type_placeholder')}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">{t('transporter.event_notes_label')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span></label>
                <textarea
                  value={eventForm.notes}
                  onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                  rows={2}
                  placeholder={t('transporter.event_notes_modal_placeholder')}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={submitEvent}
                  disabled={!eventForm.description}
                >
                  {t('transporter.event_submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={markDelivered}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  {t('traceability.mark_delivered')}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
