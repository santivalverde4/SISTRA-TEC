'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Timeline } from '@/components/shared/Timeline';
import { Modal } from '@/components/shared/Modal';
import { Truck, MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

type CampaignStatus = 'cerrada' | 'en-camino' | 'entregada';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'status' | 'logistic';
  status?: 'completed' | 'current' | 'pending';
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  destination: string;
  km: string;
  departureDate: string;
  estimatedArrival: string;
  timeline: TimelineEvent[];
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

const initialCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Ropa de invierno para refugiados',
    status: 'en-camino',
    destination: 'Comunidad San Juan, Zona Norte',
    km: '120',
    departureDate: '2026-05-12',
    estimatedArrival: '2026-05-15',
    timeline: [
      { id: '1', title: 'Campaña cerrada para donaciones', description: 'Recolección finalizada, donaciones empacadas', date: '2026-05-10', type: 'status', status: 'completed' },
      { id: '2', title: 'Camión salió', description: 'Inicio de ruta hacia Comunidad San Juan', date: '2026-05-12 08:00', type: 'logistic', status: 'completed' },
      { id: '3', title: 'Punto de control', description: 'Paso por checkpoint regional, todo en orden', date: '2026-05-13 11:30', type: 'logistic', status: 'completed' },
      { id: '4', title: 'En tránsito', description: 'Continuando hacia destino final', date: 'Actual', type: 'status', status: 'current' },
      { id: '5', title: 'Llegada estimada', description: 'Entrega programada en Comunidad San Juan', date: '2026-05-15', type: 'status', status: 'pending' },
    ],
  },
  {
    id: '2',
    name: 'Medicamentos para zonas rurales',
    status: 'cerrada',
    destination: 'Centro de Salud Rural, Zona Sur',
    km: '85',
    departureDate: '2026-05-18',
    estimatedArrival: '2026-05-20',
    timeline: [
      { id: '1', title: 'Campaña cerrada para donaciones', description: 'Recolección finalizada, en espera de despacho', date: '2026-05-15', type: 'status', status: 'completed' },
      { id: '2', title: 'Despacho pendiente', description: 'Esperando fecha de salida confirmada', date: '2026-05-18', type: 'status', status: 'pending' },
    ],
  },
  {
    id: '3',
    name: 'Útiles escolares para primarias',
    status: 'entregada',
    destination: 'Escuela Rural San Marcos',
    km: '60',
    departureDate: '2026-04-05',
    estimatedArrival: '2026-04-07',
    timeline: [
      { id: '1', title: 'Campaña cerrada para donaciones', description: 'Útiles escolares listos para transporte', date: '2026-04-03', type: 'status', status: 'completed' },
      { id: '2', title: 'Camión cargado', description: 'Todos los útiles empacados y verificados', date: '2026-04-04', type: 'logistic', status: 'completed' },
      { id: '3', title: 'Salida confirmada', description: 'Ruta hacia Escuela Rural San Marcos iniciada', date: '2026-04-05 08:00', type: 'logistic', status: 'completed' },
      { id: '4', title: 'Entrega completa', description: 'Todos los útiles entregados en Escuela Rural San Marcos', date: '2026-04-07', type: 'logistic', status: 'completed' },
      { id: '5', title: 'Campaña finalizada', description: 'Proceso completado exitosamente', date: '2026-04-07', type: 'status', status: 'completed' },
    ],
  },
];

export const TransportTraceability = () => {
  const { t } = useT();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [selected, setSelected] = useState<Campaign>(initialCampaigns[0]);
  const [eventForm, setEventForm] = useState({ type: 'Camión salió', description: '', notes: '' });
  const [showEventModal, setShowEventModal] = useState(false);
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  const currentSelected = campaigns.find(c => c.id === selected.id) ?? campaigns[0];

  const openEventModal = () => {
    setEventForm({ type: 'Camión salió', description: '', notes: '' });
    setDeliveredSuccess(false);
    setShowEventModal(true);
  };

  const submitEvent = () => {
    if (!eventForm.description) return;
    const newEvent: TimelineEvent = {
      id: String(Date.now()),
      title: eventForm.type,
      description: eventForm.description + (eventForm.notes ? ` — ${eventForm.notes}` : ''),
      date: new Date().toISOString().split('T')[0],
      type: 'logistic',
      status: 'completed',
    };
    setCampaigns(prev => prev.map(c =>
      c.id === currentSelected.id
        ? { ...c, timeline: [...c.timeline.filter(e => e.status !== 'current' && e.status !== 'pending'), newEvent, ...c.timeline.filter(e => e.status === 'current' || e.status === 'pending') ] }
        : c
    ));
    setShowEventModal(false);
  };

  const markDelivered = () => {
    const deliveryEvent: TimelineEvent = {
      id: String(Date.now()),
      title: 'Entrega completa',
      description: 'Todas las donaciones entregadas en destino',
      date: new Date().toISOString().split('T')[0],
      type: 'logistic',
      status: 'completed',
    };
    const finalEvent: TimelineEvent = {
      id: String(Date.now() + 1),
      title: 'Campaña finalizada',
      description: 'Proceso completado exitosamente',
      date: new Date().toISOString().split('T')[0],
      type: 'status',
      status: 'completed',
    };
    setCampaigns(prev => prev.map(c =>
      c.id === currentSelected.id
        ? { ...c, status: 'entregada', timeline: [...c.timeline.filter(e => e.status === 'completed'), deliveryEvent, finalEvent] }
        : c
    ));
    setDeliveredSuccess(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('traceability.transport_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('traceability.transport_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Campaign list */}
        <div className="lg:col-span-1 space-y-3">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className={`cursor-pointer transition-all ${
                currentSelected.id === campaign.id ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
              }`}
              onClick={() => { setSelected(campaign); setDeliveredSuccess(false); }}
            >
              <CardContent className="p-4">
                <h4 className="mb-2 text-sm font-medium">{campaign.name}</h4>
                <StatusBadge status={campaign.status} />
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{campaign.destination}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2>{currentSelected.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{currentSelected.destination}</span>
                  </div>
                </div>
                <StatusBadge status={currentSelected.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{t('traceability.distance')}</p>
                  </div>
                  <p className="font-medium">{currentSelected.km} km</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{t('traceability.departure')}</p>
                  </div>
                  <p className="font-medium">{formatDate(currentSelected.departureDate)}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{t('traceability.estimated_arrival')}</p>
                  </div>
                  <p className="font-medium">{formatDate(currentSelected.estimatedArrival)}</p>
                </div>
              </div>

              {currentSelected.status === 'en-camino' && (
                <div className="flex gap-3 mt-4">
                  <Button onClick={openEventModal}>{t('traceability.register_event')}</Button>
                  <Button
                    variant="outline"
                    onClick={markDelivered}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    {t('traceability.mark_delivered')}
                  </Button>
                </div>
              )}

              {currentSelected.status === 'cerrada' && (
                <div className="mt-4 bg-muted/50 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {t('traceability.pending_dispatch')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {deliveredSuccess && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-3 py-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="font-medium text-green-600">{t('traceability.delivered_success')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3>{t('traceability.transport_timeline')}</h3>
            </CardHeader>
            <CardContent>
              <Timeline events={currentSelected.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>

      {showEventModal && (
        <Modal title={`${t('traceability.register_event')} — ${currentSelected.name}`} onClose={() => setShowEventModal(false)}>
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
              <Button className="flex-1" onClick={submitEvent} disabled={!eventForm.description}>
                {t('transporter.event_submit')}
              </Button>
              <Button variant="outline" onClick={() => setShowEventModal(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
