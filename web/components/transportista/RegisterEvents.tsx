'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Badge } from '@/components/ui-custom/Badge';
import { Plus, FileText, Clock, Calendar, Info, StickyNote } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';

interface LogisticEvent {
  id: string;
  campaignName: string;
  eventType: string;
  description: string;
  notes: string;
  date: string;
  time: string;
}

const mockEvents: LogisticEvent[] = [
  {
    id: '1',
    campaignName: 'Medicamentos para zonas rurales',
    eventType: 'Camión salió',
    description: 'Inicio de ruta hacia comunidades',
    notes: 'Salida puntual, clima favorable',
    date: '2026-05-05',
    time: '08:00',
  },
  {
    id: '2',
    campaignName: 'Medicamentos para zonas rurales',
    eventType: 'Punto de control',
    description: 'Paso por checkpoint regional',
    notes: 'Todo en orden, continuamos ruta',
    date: '2026-05-06',
    time: '14:30',
  },
  {
    id: '3',
    campaignName: 'Medicamentos para zonas rurales',
    eventType: 'Ruta bloqueada',
    description: 'Desvío necesario por condiciones del camino',
    notes: 'Tomando ruta alternativa, tiempo estimado +2 horas',
    date: '2026-05-07',
    time: '10:15',
  },
];

const eventTypes = [
  'Camión salió',
  'Entrega parcial',
  'Ruta bloqueada',
  'Punto de control',
  'Parada técnica',
  'Llegada a destino',
  'Medicamentos entregados',
  'Alimentos entregados',
  'Otro',
];

export const RegisterEvents = () => {
  const { t } = useT();
  const [events, setEvents] = useState<LogisticEvent[]>(mockEvents);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    eventType: 'Camión salió',
    description: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newEvent: LogisticEvent = {
      id: String(Date.now()),
      ...formData,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
    };
    setEvents([newEvent, ...events]);
    setShowForm(false);
    setFormData({
      campaignName: '',
      eventType: 'Camión salió',
      description: '',
      notes: '',
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>{t('transporter.register_event_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('transporter.register_event_subtitle')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          {t('transporter.new_event')}
        </Button>
      </div>

      <Card className="mb-6 bg-accent/30 border-accent">
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="mb-1">{t('transporter.important_title')}</h4>
              <p className="text-sm text-muted-foreground">{t('transporter.important_message')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h3>{t('transporter.register_new_event')}</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">{t('transporter.event_campaign')}</label>
                <select
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">{t('transporter.select_campaign')}</option>
                  <option value="Medicamentos para zonas rurales">Medicamentos para zonas rurales</option>
                  <option value="Alimentos para damnificados">Alimentos para damnificados</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">{t('transporter.event_type')}</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2">{t('transporter.event_description')}</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('transporter.event_description_placeholder')}
                  required
                />
              </div>

              <div>
                <label className="block mb-2">{t('transporter.event_notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('transporter.event_notes_placeholder')}
                  rows={3}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{t('transporter.event_submit')}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t('transporter.event_log')}
        </h3>

        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h4 className="mb-1">{event.eventType}</h4>
                      <p className="text-sm text-muted-foreground">{event.campaignName}</p>
                    </div>
                    <Badge variant="info">{t('transporter.logistic_badge')}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{event.description}</p>
                  {event.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mb-2 flex items-center gap-2">
                      <StickyNote className="w-3.5 h-3.5 shrink-0" />
                      {event.notes}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(event.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{event.time}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
