'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { MapPin, CheckCircle, Calendar, Truck, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { resolveErrorKey } from '@/lib/apiError';
import {
  getMyAssignedCampaigns, registerEvent, markDelivered as markDeliveredApi,
  type AssignedCampaign,
} from '@/services/transporterService';

type FilterStatus = 'all' | 'en-camino' | 'entregada' | 'finalizada';

export const AssignedCampaigns = () => {
  const router = useRouter();
  const { t } = useT();

  const eventTypes = [
    t('transporter.event_type_truck_departed'),
    t('transporter.event_type_route_blocked'),
    t('transporter.event_type_checkpoint'),
    t('transporter.event_type_technical_stop'),
    t('transporter.event_type_other'),
  ];
  const [campaigns, setCampaigns] = useState<AssignedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [eventTarget, setEventTarget] = useState<AssignedCampaign | null>(null);
  const [eventForm, setEventForm] = useState({ type: '', description: '', notes: '' });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [delivered, setDelivered] = useState(false);

  useEffect(() => {
    getMyAssignedCampaigns()
      .then(setCampaigns)
      .catch(() => setError(t('errors.load_failed')))
      .finally(() => setLoading(false));
  }, [t]);

  const openEventModal = (c: AssignedCampaign) => {
    setEventTarget(c);
    setEventForm({ type: eventTypes[0], description: '', notes: '' });
    setEventError(null);
    setDelivered(false);
  };

  const validateEventForm = (): string | null => {
    if (!eventForm.description.trim()) return t('transporter.error_description_required');
    if (eventForm.description.trim().length < 10) return t('transporter.error_description_min');
    if (eventForm.description.trim().length > 300) return t('transporter.error_description_max');
    if (eventForm.notes.trim().length > 500) return t('transporter.error_notes_max');
    return null;
  };

  const submitEvent = async () => {
    if (!eventTarget) return;
    const validationError = validateEventForm();
    if (validationError) { setEventError(validationError); return; }
    setEventLoading(true);
    setEventError(null);
    try {
      await registerEvent({
        campaignId: eventTarget.assignmentId,
        type: eventForm.type,
        description: eventForm.description,
        notes: eventForm.notes || undefined,
      });
      setCampaigns(prev => prev.map(c =>
        c.id === eventTarget.id ? { ...c, eventsCount: c.eventsCount + 1 } : c
      ));
      setDelivered(false);
      setEventTarget(null);
    } catch (err) {
      setEventError(t(resolveErrorKey(err) as Parameters<typeof t>[0]));
    } finally {
      setEventLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!eventTarget) return;
    setEventLoading(true);
    setEventError(null);
    try {
      await markDeliveredApi(eventTarget.assignmentId);
      setCampaigns(prev => prev.map(c =>
        c.id === eventTarget.id ? { ...c, status: 'entregada' as const } : c
      ));
      setDelivered(true);
    } catch (err) {
      setEventError(t(resolveErrorKey(err) as Parameters<typeof t>[0]));
    } finally {
      setEventLoading(false);
    }
  };

  const filtered = campaigns.filter(c => filter === 'all' || c.status === filter);

  if (loading) {
    return <div className="p-6 text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="p-6 text-center py-16 text-destructive">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('transporter.assigned_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('transporter.assigned_subtitle')}</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: 'all', label: t('transporter.filter_all') },
          { value: 'en-camino', label: t('transporter.filter_in_transit') },
          { value: 'entregada', label: t('transporter.filter_delivered') },
          { value: 'finalizada', label: t('transporter.filter_finalized') },
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
                <Button variant="outline" onClick={() => router.push(`/dashboard/transportista/traceability?assignmentId=${campaign.assignmentId}`)}>
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
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">{t('transporter.event_description_label')}</label>
                  <span className={`text-xs ${eventForm.description.length > 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {eventForm.description.length}/300
                  </span>
                </div>
                <Input
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder={t('transporter.select_type_placeholder')}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">{t('transporter.event_notes_label')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span></label>
                  <span className={`text-xs ${eventForm.notes.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {eventForm.notes.length}/500
                  </span>
                </div>
                <textarea
                  value={eventForm.notes}
                  onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                  rows={2}
                  placeholder={t('transporter.event_notes_modal_placeholder')}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              {eventError && <p className="text-sm text-destructive">{eventError}</p>}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={submitEvent}
                  disabled={eventLoading}
                >
                  {eventLoading ? t('common.loading') : t('transporter.event_submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleMarkDelivered}
                  disabled={eventLoading}
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
