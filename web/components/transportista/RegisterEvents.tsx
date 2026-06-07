'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Badge } from '@/components/ui-custom/Badge';
import { ContextHelp } from '@/components/ui-custom/ContextHelp';
import { FieldExplanation } from '@/components/ui-custom/FieldExplanation';
import { ConstructiveError } from '@/components/ui-custom/ConstructiveError';
import { Plus, FileText, Clock, Calendar, Info, StickyNote } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { resolveErrorKey } from '@/lib/apiError';
import { useT } from '@/lib/i18n/useT';
import {
  getMyAssignedCampaigns,
  getMyEvents,
  registerEvent,
  type AssignedCampaign,
  type LogisticEvent,
} from '@/services/transporterService';

export const RegisterEvents = () => {
  const { t } = useT();

  const eventTypes = [
    t('transporter.event_type_truck_departed'),
    t('transporter.event_type_route_blocked'),
    t('transporter.event_type_checkpoint'),
    t('transporter.event_type_technical_stop'),
    t('transporter.event_type_other'),
  ];

  const [campaigns, setCampaigns] = useState<AssignedCampaign[]>([]);
  const [events, setEvents] = useState<LogisticEvent[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    assignmentId: '',
    eventType: eventTypes[0],
    description: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEventFormValid = formData.assignmentId !== '' && formData.description.trim().length > 0;

  useEffect(() => {
    Promise.all([getMyAssignedCampaigns(), getMyEvents()])
      .then(([campaignList, eventList]) => {
        setCampaigns(campaignList);
        setEvents(eventList);
        if (campaignList.length > 0) {
          setFormData((prev) => ({ ...prev, assignmentId: campaignList[0].assignmentId }));
        }
      })
      .catch((err) => setPageError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0])))
      .finally(() => setLoadingPage(false));
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setFormError('Debes describir qué sucedió en el evento');
      return;
    }
    if (formData.description.trim().length < 10) {
      setFormError('La descripción es muy corta. Necesitamos al menos 10 caracteres para entender el evento');
      return;
    }
    if (formData.description.trim().length > 300) {
      setFormError('La descripción es muy larga. Máximo 300 caracteres');
      return;
    }
    if (formData.notes.trim().length > 500) {
      setFormError('Las notas adicionales son muy largas. Máximo 500 caracteres');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await registerEvent({
        campaignId: formData.assignmentId,
        type: formData.eventType,
        description: formData.description,
        notes: formData.notes || undefined,
      });
      const updated = await getMyEvents();
      setEvents(updated);
      setShowForm(false);
      setFormData((prev) => ({ ...prev, eventType: eventTypes[0], description: '', notes: '' }));
    } catch (err) {
      setFormError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0]));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return <div className="p-6 text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (pageError) {
    return <div className="p-6 text-center py-16 text-destructive">{pageError}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>{t('transporter.register_event_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('transporter.register_event_subtitle')}</p>
        </div>
        {campaigns.length > 0 && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />
            {t('transporter.new_event')}
          </Button>
        )}
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
              <FieldExplanation text="Registra cada evento importante durante el transporte para que el equipo pueda rastrear el estado de la campaña en tiempo real. Esto ayuda a mantener a los donantes informados." />

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  {t('transporter.event_campaign')}
                  <ContextHelp 
                    text="Selecciona la campaña de donación a la cual está asignado este transporte"
                    title="¿Qué es una campaña?"
                  />
                </label>
                <select
                  value={formData.assignmentId}
                  onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">{t('transporter.select_campaign')}</option>
                  {campaigns.map((c) => (
                    <option key={c.assignmentId} value={c.assignmentId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  {t('transporter.event_type')}
                  <ContextHelp 
                    text="
• Camión Partió: El vehículo inició el viaje
• Ruta Bloqueada: Hay un obstáculo en el camino
• Punto de Control: Pasaste por un control oficial
• Parada Técnica: El vehículo paró por mantenimiento
• Otro: Cualquier otro evento importante
"
                    title="¿Qué significa cada tipo?"
                  />
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium flex items-center gap-2">
                    {t('transporter.event_description')}
                    <ContextHelp 
                      text="Describe qué sucedió de forma clara y concisa. Incluye detalles importantes: ubicación, hora aproximada, si hay retrasos, etc."
                      title="¿Cómo debo describir el evento?"
                    />
                  </label>
                  <span className={`text-xs ${formData.description.length > 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.description.length}/300
                  </span>
                </div>
                <Input
                  value={formData.description}
                  onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setFormError(''); }}
                  placeholder="Ej: Camión partió a las 8:00am desde el depósito central..."
                  error={formError}
                />
                <FieldExplanation text="Sé específico: incluye ubicación, hora y cualquier detalle que sea importante para el seguimiento." />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium flex items-center gap-2">
                    {t('transporter.event_notes')}{' '}
                    <span className="text-muted-foreground font-normal text-sm">{t('common.optional')}</span>
                    <ContextHelp 
                      text="Información adicional que podría ser útil. Por ejemplo: condiciones climáticas, incidentes menores, cambios de ruta, etc."
                      title="¿Cuándo debo agregar notas?"
                    />
                  </label>
                  <span className={`text-xs ${formData.notes.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.notes.length}/500
                  </span>
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('transporter.event_notes_placeholder')}
                  rows={3}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {formError && (
                <ConstructiveError 
                  error={formError}
                  suggestion="Revisa los campos: descripción debe tener entre 10 y 300 caracteres"
                />
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !isEventFormValid}>
                  {submitting ? t('common.loading') : t('transporter.event_submit')}
                </Button>
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

        {events.length === 0 && (
          <p className="text-muted-foreground text-sm">{t('common.no_results')}</p>
        )}

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
                      <h4 className="mb-1">{event.label}</h4>
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
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(event.occurredAt.split('T')[0])}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {event.occurredAt.split('T')[1]?.slice(0, 5) ?? ''}
                    </span>
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
