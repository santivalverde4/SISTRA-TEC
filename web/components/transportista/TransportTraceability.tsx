'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Timeline } from '@/components/shared/Timeline';
import { Modal } from '@/components/shared/Modal';
import { Truck, MapPin, Package, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { resolveErrorKey } from '@/lib/apiError';
import { useT } from '@/lib/i18n/useT';
import {
  getMyAssignedCampaigns,
  getCampaignTracking,
  registerEvent,
  markDelivered,
  type AssignedCampaign,
  type CampaignWithTimeline,
} from '@/services/transporterService';

const eventTypes = [
  'Camión salió',
  'Entrega parcial',
  'Ruta bloqueada',
  'Punto de control',
  'Parada técnica',
  'Llegada a destino',
  'Otro',
];

export const TransportTraceability = () => {
  const { t } = useT();
  const searchParams = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId');

  const [campaigns, setCampaigns] = useState<AssignedCampaign[]>([]);
  const [selected, setSelected] = useState<CampaignWithTimeline | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [listError, setListError] = useState('');
  const [detailError, setDetailError] = useState('');

  const [eventForm, setEventForm] = useState({ type: eventTypes[0], description: '', notes: '' });
  const [eventFormError, setEventFormError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const [deliveredSuccess, setDeliveredSuccess] = useState(false);
  const [delivering, setDelivering] = useState(false);

  const loadTracking = useCallback(async (assignmentId: string) => {
    setLoadingDetail(true);
    setDetailError('');
    setDeliveredSuccess(false);
    try {
      const data = await getCampaignTracking(assignmentId);
      setSelected(data);
    } catch (err) {
      setDetailError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0]));
    } finally {
      setLoadingDetail(false);
    }
  }, [t]);

  useEffect(() => {
    setLoadingList(true);
    getMyAssignedCampaigns()
      .then((data) => {
        setCampaigns(data);
        if (data.length === 0) return;

        const target = initialAssignmentId
          ? data.find((c) => c.assignmentId === initialAssignmentId) ?? data[0]
          : data[0];

        loadTracking(target.assignmentId);
      })
      .catch((err) => setListError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0])))
      .finally(() => setLoadingList(false));
  }, [initialAssignmentId, loadTracking, t]);

  const handleSelectCampaign = (campaign: AssignedCampaign) => {
    loadTracking(campaign.assignmentId);
  };

  const openEventModal = () => {
    setEventForm({ type: eventTypes[0], description: '', notes: '' });
    setEventFormError('');
    setShowEventModal(true);
  };

  const submitEvent = async () => {
    if (!selected) return;
    if (!eventForm.description.trim()) {
      setEventFormError(t('transporter.error_description_required'));
      return;
    }
    setEventSubmitting(true);
    setEventFormError('');
    try {
      await registerEvent({
        campaignId: selected.assignmentId,
        type: eventForm.type,
        description: eventForm.description,
        notes: eventForm.notes || undefined,
      });
      setShowEventModal(false);
      await loadTracking(selected.assignmentId);
    } catch (err) {
      setEventFormError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0]));
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selected) return;
    setDelivering(true);
    try {
      await markDelivered(selected.assignmentId);
      setDeliveredSuccess(true);
      await loadTracking(selected.assignmentId);
    } catch (err) {
      setDetailError(t(resolveErrorKey(err, 'errors') as Parameters<typeof t>[0]));
    } finally {
      setDelivering(false);
    }
  };

  if (loadingList) {
    return <div className="p-6 text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (listError) {
    return <div className="p-6 text-center py-16 text-destructive">{listError}</div>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1>{t('traceability.transport_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('traceability.transport_subtitle')}</p>
        </div>
        <p className="text-muted-foreground">{t('common.no_results')}</p>
      </div>
    );
  }

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
              key={campaign.assignmentId}
              className={`cursor-pointer transition-all ${
                selected?.assignmentId === campaign.assignmentId ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectCampaign(campaign)}
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
          {loadingDetail ? (
            <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>
          ) : detailError ? (
            <div className="text-center py-16 text-destructive">{detailError}</div>
          ) : selected ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2>{selected.name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{selected.destination}</span>
                      </div>
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-primary" />
                        <p className="text-xs text-muted-foreground">{t('traceability.distance')}</p>
                      </div>
                      <p className="font-medium">{selected.km} km</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-primary" />
                        <p className="text-xs text-muted-foreground">{t('traceability.departure')}</p>
                      </div>
                      <p className="font-medium">{formatDate(selected.departureDate)}</p>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-xs text-muted-foreground">{t('traceability.estimated_arrival')}</p>
                      </div>
                      <p className="font-medium">{formatDate(selected.estimatedArrival)}</p>
                    </div>
                  </div>

                  {selected.status === 'en-camino' && (
                    <div className="flex gap-3 mt-4">
                      <Button onClick={openEventModal}>{t('traceability.register_event')}</Button>
                      <Button
                        variant="outline"
                        onClick={handleMarkDelivered}
                        disabled={delivering}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        {delivering ? t('common.loading') : t('traceability.mark_delivered')}
                      </Button>
                    </div>
                  )}

                  {selected.status === 'cerrada' && (
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
                  <Timeline events={selected.timeline} />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>

      {showEventModal && selected && (
        <Modal
          title={`${t('traceability.register_event')} — ${selected.name}`}
          onClose={() => setShowEventModal(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">{t('transporter.event_type_label')}</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {eventTypes.map((et) => <option key={et} value={et}>{et}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">{t('transporter.event_description_label')}</label>
              <Input
                value={eventForm.description}
                onChange={(e) => { setEventForm({ ...eventForm, description: e.target.value }); setEventFormError(''); }}
                placeholder={t('transporter.select_type_placeholder')}
                error={eventFormError}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">
                {t('transporter.event_notes_label')}{' '}
                <span className="text-muted-foreground font-normal">{t('common.optional')}</span>
              </label>
              <textarea
                value={eventForm.notes}
                onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                rows={2}
                placeholder={t('transporter.event_notes_modal_placeholder')}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={submitEvent} disabled={eventSubmitting}>
                {eventSubmitting ? t('common.loading') : t('transporter.event_submit')}
              </Button>
              <Button variant="outline" onClick={() => setShowEventModal(false)}>{t('common.cancel')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
