'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import {
  Search, Filter, Edit, Trash2, Plus, MoreVertical,
  Truck, Calendar, Package, Tag, MapPin, Route,
  ChevronLeft, ChevronRight, AlertTriangle,
} from 'lucide-react';
import type { CampaignStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { DateInput } from '@/components/ui-custom/DateInput';
import { useT } from '@/lib/i18n/useT';
import { resolveErrorKey } from '@/lib/apiError';
import { getAllowedTransitions, canEditCampaign, canAssignTransporter, canDeleteCampaign, CAMPAIGN_STATUS_LABELS } from '@/lib/campaignStatus';
import {
  getCampaigns, getTransporters, updateCampaign, deleteCampaign, assignTransporter,
  type Campaign as BackendCampaign,
  type BackendTransporter,
} from '@/services/campaignService';

const PAGE_SIZE = 5;

const nextDay = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  return next.toLocaleDateString('en-CA');
};

interface AssignForm {
  transporterId: string;
  destination: string;
  distanceKm: string;
  departureDate: string;
  estimatedArrival: string;
}

interface EditForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  categories: string[];
}

export const ManageCampaigns = () => {
  const router = useRouter();
  const { t } = useT();
  const today = new Date().toLocaleDateString('en-CA');

  const [campaigns, setCampaigns] = useState<BackendCampaign[]>([]);
  const [transporters, setTransporters] = useState<BackendTransporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const [editTarget, setEditTarget] = useState<BackendCampaign | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BackendCampaign | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [detailsTarget, setDetailsTarget] = useState<BackendCampaign | null>(null);

  const [assignTarget, setAssignTarget] = useState<BackendCampaign | null>(null);
  const [assignForm, setAssignForm] = useState<AssignForm>({
    transporterId: '', destination: '', distanceKm: '', departureDate: '', estimatedArrival: '',
  });
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({});
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCampaigns(), getTransporters()])
      .then(([camps, trans]) => {
        setCampaigns(camps);
        setTransporters(trans);
      })
      .catch(() => setError(t('errors.load_failed')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { setPage(1); }, [searchTerm, filterStatus]);

  const filtered = campaigns
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (c: BackendCampaign) => {
    setEditTarget(c);
    setEditForm({
      name: c.name,
      description: c.description,
      startDate: c.startDate.split('T')[0],
      endDate: c.endDate.split('T')[0],
      status: c.status,
      categories: c.categories,
    });
    setEditErrors({});
  };

  const saveEdit = async () => {
    if (!editTarget || !editForm) return;
    const errs: Record<string, string> = {};
    if (editForm.name.trim().length < 3) {
      errs.name = t('campaign.error_name_min');
    } else if (editForm.name.trim().length > 100) {
      errs.name = t('campaign.error_name_max');
    }
    if (editForm.description.trim().length < 10) {
      errs.description = t('campaign.error_description_min');
    } else if (editForm.description.trim().length > 1000) {
      errs.description = t('campaign.error_description_max');
    }
    if (!editForm.endDate) errs.endDate = t('campaign.error_end_required');
    if (editForm.endDate && editForm.endDate <= editForm.startDate) {
      errs.endDate = t('campaign.error_end_before_start');
    }
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }

    setEditLoading(true);
    try {
      const updated = await updateCampaign(editTarget.id, {
        name: editForm.name,
        description: editForm.description,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        status: editForm.status,
        categories: editForm.categories,
      });
      setCampaigns((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      setEditTarget(null);
      setEditForm(null);
    } catch (err) {
      setEditErrors({ general: t(resolveErrorKey(err, 'campaign') as Parameters<typeof t>[0]) });
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCampaign(deleteTarget.id);
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(t(resolveErrorKey(err, 'campaign') as Parameters<typeof t>[0]));
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAssign = (c: BackendCampaign) => {
    setAssignTarget(c);
    setAssignErrors({});
    setAssignError(null);
    const existing = c.assignment;
    setAssignForm({
      transporterId: existing?.transporterId ?? '',
      destination: existing?.destination ?? '',
      distanceKm: existing ? String(existing.distanceKm) : '',
      departureDate: existing?.departureDate ? existing.departureDate.split('T')[0] : '',
      estimatedArrival: existing?.estimatedArrival ? existing.estimatedArrival.split('T')[0] : '',
    });
  };

  const saveAssignment = async () => {
    if (!assignTarget) return;
    const errs: Record<string, string> = {};
    if (!assignForm.transporterId) errs.transporterId = t('errors.field_required');
    if (!assignForm.destination.trim()) errs.destination = t('errors.field_required');
    if (!assignForm.distanceKm || Number(assignForm.distanceKm) <= 0) errs.distanceKm = t('errors.distance_invalid');
    if (!assignForm.departureDate) errs.departureDate = t('errors.departure_date_required');
    if (!assignForm.estimatedArrival) errs.estimatedArrival = t('errors.arrival_date_required');
    if (Object.keys(errs).length > 0) { setAssignErrors(errs); return; }
    setAssignLoading(true);
    setAssignError(null);
    setAssignErrors({});
    try {
      await assignTransporter(assignTarget.id, {
        transporterId: assignForm.transporterId,
        destination: assignForm.destination,
        distanceKm: Number(assignForm.distanceKm),
        departureDate: assignForm.departureDate,
        estimatedArrival: assignForm.estimatedArrival,
      });
      const refreshed = await getCampaigns();
      setCampaigns(refreshed);
      setAssignTarget(null);
    } catch (err) {
      setAssignError(t(resolveErrorKey(err, 'assignment') as Parameters<typeof t>[0]));
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-16 text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-16 text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1>{t('campaign.manage_title')}</h1>
          <p className="text-muted-foreground mt-1">{t('campaign.manage_subtitle')}</p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/campaigns/create')}>
          <Plus className="w-4 h-4" />
          {t('campaign.new_campaign')}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('campaign.search_placeholder')}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
                className="w-full pl-10 pr-8 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:min-w-[180px]"
              >
                <option value="all">{t('campaign.all_statuses')}</option>
                <option value="abierta">{t('campaign.status_open')}</option>
                <option value="congelada">{t('campaign.status_frozen')}</option>
                <option value="cerrada">{t('campaign.status_closed')}</option>
                <option value="en-camino">{t('campaign.status_in_transit')}</option>
                <option value="entregada">{t('campaign.status_delivered')}</option>
                <option value="finalizada">{t('campaign.status_finalized')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {paginated.map((campaign) => {
          const asgn = campaign.assignment;
          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate mb-1">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                    <p className="text-muted-foreground mt-2 mb-3">{campaign.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />
                        {campaign.donationsCount} {t('campaign.donations')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {campaign.categories.join(', ')}
                      </span>
                    </div>
                    {asgn && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Truck className="w-4 h-4" />
                          {asgn.transporter.name} · {asgn.transporter.vehicle}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />{asgn.destination}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Route className="w-3.5 h-3.5" />{asgn.distanceKm} km
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 sm:flex-row sm:gap-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => openAssign(campaign)}
                      disabled={!canAssignTransporter(campaign)}
                      title={t('transporters.assign_title')}
                    >
                      <Truck className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => openEdit(campaign)}
                      disabled={!canEditCampaign(campaign)}
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setDeleteTarget(campaign)}
                      disabled={!canDeleteCampaign(campaign)}
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDetailsTarget(campaign)} title={t('campaign.view_details')}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('campaign.no_campaigns_manage')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Assign transporter modal */}
      {assignTarget && (
        <Modal title={t('transporters.assign_title')} onClose={() => setAssignTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('transporters.assign_campaign_label')} <span className="font-medium text-foreground">{assignTarget.name}</span>
            </p>
            <div>
              <label className="block mb-1 text-sm font-medium">{t('transporters.assign_transporter_label')}</label>
              <select
                value={assignForm.transporterId}
                onChange={(e) => { setAssignForm({ ...assignForm, transporterId: e.target.value }); setAssignErrors((p) => ({ ...p, transporterId: '' })); }}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t('transporters.select_transporter')}</option>
                {transporters.map((tr) => (
                  <option key={tr.id} value={tr.id}>{tr.name} — {tr.vehicle}</option>
                ))}
              </select>
              {assignErrors.transporterId && <p className="mt-1 text-sm text-destructive">{assignErrors.transporterId}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">{t('transporters.destination')}</label>
              <Input
                value={assignForm.destination}
                onChange={(e) => { setAssignForm({ ...assignForm, destination: e.target.value.slice(0, 250) }); setAssignErrors((p) => ({ ...p, destination: '' })); }}
                placeholder={t('transporters.destination_placeholder')}
                maxLength={250}
                error={assignErrors.destination}
              />
              <p className="mt-1 text-xs text-muted-foreground text-right">{assignForm.destination.length}/250</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium">{t('transporters.distance_km')}</label>
                <Input
                  type="number"
                  min="1"
                  value={assignForm.distanceKm}
                  onChange={(e) => { setAssignForm({ ...assignForm, distanceKm: e.target.value }); setAssignErrors((p) => ({ ...p, distanceKm: '' })); }}
                  placeholder={t('transporters.distance_placeholder')}
                  error={assignErrors.distanceKm}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-sm font-medium">{t('campaign.start_date_label')}</label>
                <DateInput
                  value={assignForm.departureDate}
                  onChange={(v) => { setAssignForm({ ...assignForm, departureDate: v }); setAssignErrors((p) => ({ ...p, departureDate: '' })); }}
                  min={today}
                  error={assignErrors.departureDate}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">{t('campaign.end_date_label')}</label>
                <DateInput
                  value={assignForm.estimatedArrival}
                  onChange={(v) => { setAssignForm({ ...assignForm, estimatedArrival: v }); setAssignErrors((p) => ({ ...p, estimatedArrival: '' })); }}
                  min={assignForm.departureDate || undefined}
                  error={assignErrors.estimatedArrival}
                />
              </div>
            </div>
            {assignError && <p className="text-sm text-destructive">{assignError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAssignTarget(null)}>{t('common.cancel')}</Button>
              <Button
                onClick={saveAssignment}
                disabled={assignLoading || !assignForm.transporterId || !assignForm.destination || !assignForm.distanceKm}
              >
                {assignLoading ? t('common.loading') : t('common.assign')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editTarget && editForm && (
        <Modal title={t('campaign.edit_title')} onClose={() => { setEditTarget(null); setEditForm(null); setEditErrors({}); }}>
          <div className="space-y-4">
            {(() => {
              const isStatusOnly = editTarget.status === 'en-camino' || editTarget.status === 'entregada';
              return (
                <>
                  {editTarget.status === 'en-camino' && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
                      <span>{t('campaign.locked_in_transit')}</span>
                    </div>
                  )}
                  {editTarget.status === 'entregada' && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <Package className="w-4 h-4 shrink-0" />
                        <span>{t('campaign.prompt_finalize')}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {t('campaign.status_delivered')}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">{t('campaign.name')}</label>
                      <span className={`text-xs ${editForm.name.length > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {editForm.name.length}/100
                      </span>
                    </div>
                    <Input
                      value={editForm.name}
                      onChange={(e) => { setEditForm({ ...editForm, name: e.target.value }); setEditErrors((p) => ({ ...p, name: '' })); }}
                      error={editErrors.name}
                      disabled={isStatusOnly}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">{t('campaign.description')}</label>
                      <span className={`text-xs ${editForm.description.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {editForm.description.length}/1000
                      </span>
                    </div>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => { setEditForm({ ...editForm, description: e.target.value }); setEditErrors((p) => ({ ...p, description: '' })); }}
                      rows={3}
                      disabled={isStatusOnly}
                      className={`w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none${isStatusOnly ? ' opacity-50 cursor-not-allowed bg-muted' : ''}`}
                    />
                    {editErrors.description && <p className="mt-1 text-sm text-destructive">{editErrors.description}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">{t('campaign.start_date_label')}</label>
                      <DateInput
                        value={editForm.startDate}
                        onChange={() => {}}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">{t('campaign.end_date_label')}</label>
                      <DateInput
                        value={editForm.endDate}
                        onChange={(v) => setEditForm({ ...editForm, endDate: v })}
                        min={nextDay(editForm.startDate || today)}
                        error={editErrors.endDate}
                        disabled={isStatusOnly}
                      />
                    </div>
                  </div>
                </>
              );
            })()}
            <div>
              <label className="block mb-1 text-sm font-medium">{t('campaign.status')}</label>
              {(() => {
                const allowed = getAllowedTransitions(editTarget, today);
                // Always include current status as the "keep current" option
                const options: CampaignStatus[] = [editTarget.status, ...allowed];
                const showNoTransporterHint = editTarget.status === 'cerrada' && !editTarget.assignment;
                return (
                  <>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CampaignStatus })}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      disabled={allowed.length === 0}
                    >
                      {options.map((s) => (
                        <option key={s} value={s}>{t(CAMPAIGN_STATUS_LABELS[s] as Parameters<typeof t>[0])}</option>
                      ))}
                    </select>
                    {showNoTransporterHint && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400 mt-2">
                        <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" />
                        <span>{t('campaign.no_transporter_for_transit')}</span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            {editErrors.general && <p className="text-sm text-destructive">{editErrors.general}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setEditTarget(null); setEditForm(null); setEditErrors({}); }}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={saveEdit}
                disabled={editLoading || !editForm.name.trim() || !editForm.description.trim() || !editForm.startDate || !editForm.endDate}
              >
                {editLoading ? t('common.loading') : t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <Modal title={t('campaign.delete_campaign')} onClose={() => { setDeleteTarget(null); setDeleteError(null); }}>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('campaign.delete_confirm')}{' '}
              <span className="font-semibold text-foreground">"{deleteTarget.name}"</span>?{' '}
              {t('campaign.delete_warning')}
            </p>
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError(null); }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={confirmDelete} disabled={deleteLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {deleteLoading ? t('common.loading') : t('common.delete')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Details modal */}
      {detailsTarget && (
        <Modal title={t('campaign.details_title')} onClose={() => setDetailsTarget(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="flex-1">{detailsTarget.name}</h3>
              <StatusBadge status={detailsTarget.status} />
            </div>
            <p className="text-muted-foreground">{detailsTarget.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">{t('campaign.start_date_label')}</p>
                <p className="font-medium">{formatDate(detailsTarget.startDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">{t('campaign.end_date_label')}</p>
                <p className="font-medium">{formatDate(detailsTarget.endDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">{t('campaign.donations_received')}</p>
                <p className="font-medium text-primary flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />{detailsTarget.donationsCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">{t('campaign.categories_label')}</p>
                <p className="font-medium">{detailsTarget.categories.join(', ')}</p>
              </div>
            </div>
            {detailsTarget.assignment && (
              <div className="border border-border rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4" /> {t('transporters.assign_title')}
                </p>
                <p className="text-muted-foreground">
                  {t('transporters.assign_transporter_label')}:{' '}
                  <span className="text-foreground font-medium">
                    {detailsTarget.assignment.transporter.name} — {detailsTarget.assignment.transporter.vehicle}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  {t('transporters.destination')}:{' '}
                  <span className="text-foreground font-medium">{detailsTarget.assignment.destination}</span>
                </p>
                <p className="text-muted-foreground">
                  {t('transporters.distance_km')}:{' '}
                  <span className="text-foreground font-medium">{detailsTarget.assignment.distanceKm} km</span>
                </p>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-border">
              <Button
                variant="outline"
                onClick={() => { setDetailsTarget(null); openAssign(detailsTarget); }}
                disabled={!canAssignTransporter(detailsTarget)}
              >
                <Truck className="w-4 h-4" />{t('common.assign')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setDetailsTarget(null); openEdit(detailsTarget); }}
                disabled={!canEditCampaign(detailsTarget)}
              >
                <Edit className="w-4 h-4" />{t('common.edit')}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setDetailsTarget(null); setDeleteTarget(detailsTarget); }}
                disabled={!canDeleteCampaign(detailsTarget)}
                className="text-destructive border-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />{t('common.delete')}
              </Button>
              <Button onClick={() => setDetailsTarget(null)}>{t('common.close')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
