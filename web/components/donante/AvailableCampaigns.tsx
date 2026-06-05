'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Badge } from '@/components/ui-custom/Badge';
import { Search, Filter, Heart, Calendar, X, CheckCircle, Plus, Trash2, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useT } from '@/lib/i18n/useT';
import { resolveErrorKey } from '@/lib/apiError';
import {
  getAvailableCampaigns, submitDonation as submitDonationApi,
  type AvailableCampaign as Campaign,
} from '@/services/donationService';

interface DonationRow {
  id: number;
  description: string;
  quantity: string;
}

const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      {children}
    </div>
  </div>
);

export const AvailableCampaigns = () => {
  const { t } = useT();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    getAvailableCampaigns()
      .then(setCampaigns)
      .catch((err) => setError(t(resolveErrorKey(err) as Parameters<typeof t>[0])))
      .finally(() => setLoading(false));
  }, [t]);

  const [detailsCampaign, setDetailsCampaign] = useState<Campaign | null>(null);
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [donateRows, setDonateRows] = useState<DonationRow[]>([{ id: 1, description: '', quantity: '' }]);
  const [donateNote, setDonateNote] = useState('');
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<number, { description?: string; quantity?: string }>>({});

  const addRow = () => setDonateRows(prev => [...prev, { id: Date.now(), description: '', quantity: '' }]);
  const removeRow = (id: number) => {
    setDonateRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev);
    setRowErrors(prev => { const n = { ...prev }; delete n[id]; return n; });
  };
  const updateRow = (id: number, field: 'description' | 'quantity', value: string) =>
    setDonateRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || campaign.categories.includes(filterCategory);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const pagedCampaigns = filteredCampaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDonate = (c: Campaign) => {
    setDonateCampaign(c);
    setDonateRows([{ id: 1, description: '', quantity: '' }]);
    setDonateNote('');
    setDonateSuccess(false);
    setRowErrors({});
  };

  const validateRows = (): boolean => {
    const errors: Record<number, { description?: string; quantity?: string }> = {};
    donateRows.forEach((row) => {
      const rowErr: { description?: string; quantity?: string } = {};
      if (!row.description.trim()) rowErr.description = t('donation.error_description_required');
      const qty = Number(row.quantity);
      if (!row.quantity.trim()) rowErr.quantity = t('donation.error_quantity_required');
      else if (isNaN(qty) || qty <= 0) rowErr.quantity = t('donation.error_quantity_positive');
      if (Object.keys(rowErr).length > 0) errors[row.id] = rowErr;
    });
    setRowErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDonation = async () => {
    if (!donateCampaign || !validateRows()) return;
    setDonateLoading(true);
    setDonateError(null);
    try {
      await submitDonationApi({
        campaignId: donateCampaign.id,
        items: donateRows
          .filter(r => r.description && r.quantity)
          .map(r => ({ description: r.description, quantity: Number(r.quantity) })),
        note: donateNote || undefined,
      });
      setCampaigns(prev => prev.map(c =>
        c.id === donateCampaign.id ? { ...c, donationsCount: c.donationsCount + 1 } : c
      ));
      setDonateSuccess(true);
    } catch (err) {
      setDonateError(t(resolveErrorKey(err, 'donation') as Parameters<typeof t>[0]));
    } finally {
      setDonateLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="p-6 text-center py-16 text-destructive">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{t('campaign.available_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('campaign.available_subtitle')}</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder={t('campaign.search_placeholder')}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="pl-10 pr-8 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px]"
              >
                <option value="all">{t('campaign.all_categories')}</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Ropa">Ropa</option>
                <option value="Medicamentos">Medicamentos</option>
                <option value="Suministros">Suministros</option>
                <option value="Educación">Educación</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pagedCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <h3 className="mb-2">{campaign.name}</h3>
              <div className="flex flex-wrap gap-2">
                {campaign.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{campaign.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(campaign.startDate)}</span>
                </div>
                <span>→</span>
                <span>{formatDate(campaign.endDate)}</span>
                <span className="ml-auto font-medium text-primary flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />{campaign.donationsCount} {t('campaign.donations')}
                </span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => openDonate(campaign)}>
                  <Heart className="w-4 h-4" />
                  {t('campaign.donate_now')}
                </Button>
                <Button variant="outline" onClick={() => setDetailsCampaign(campaign)}>
                  {t('campaign.view_details')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('campaign.no_campaigns')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}

      {/* Details modal */}
      {detailsCampaign && (
        <Modal onClose={() => setDetailsCampaign(null)}>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">{detailsCampaign.name}</h2>
            <button onClick={() => setDetailsCampaign(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-muted-foreground">{detailsCampaign.description}</p>
            <div className="flex flex-wrap gap-2">
              {detailsCampaign.categories.map(cat => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('campaign.start_date_label')}</p>
                <p className="font-medium">{formatDate(detailsCampaign.startDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('campaign.end_date_label')}</p>
                <p className="font-medium">{formatDate(detailsCampaign.endDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('campaign.donations_received')}</p>
                <p className="font-medium text-primary flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />{detailsCampaign.donationsCount}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => { setDetailsCampaign(null); openDonate(detailsCampaign); }}>
                <Heart className="w-4 h-4" />
                {t('campaign.donate_to')}
              </Button>
              <Button variant="outline" onClick={() => setDetailsCampaign(null)}>{t('common.close')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Donate modal */}
      {donateCampaign && (
        <Modal onClose={() => setDonateCampaign(null)}>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('donation.perform_donation')}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{donateCampaign.name}</p>
            </div>
            <button onClick={() => setDonateCampaign(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {donateSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="font-semibold text-lg">{t('donation.success_title')}</h3>
                <p className="text-muted-foreground text-sm">{t('donation.success_message')}</p>
                <div className="flex gap-3 justify-center pt-2">
                  <Button variant="outline" onClick={() => setDonateCampaign(null)}>{t('common.close')}</Button>
                  <Button onClick={() => { setDonateCampaign(null); openDonate(donateCampaign); }}>
                    {t('donation.donate_again')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_120px_32px] gap-2 text-sm font-medium text-muted-foreground px-1">
                  <span>{t('donation.column_product')}</span>
                  <span>{t('donation.column_quantity')}</span>
                  <span />
                </div>
                <div className="space-y-2">
                  {donateRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[1fr_120px_32px] gap-2 items-start">
                      <Input
                        value={row.description}
                        onChange={(e) => { updateRow(row.id, 'description', e.target.value); setRowErrors((prev) => { const n = { ...prev }; if (n[row.id]) delete n[row.id].description; return n; }); }}
                        placeholder={t('donation.product_placeholder')}
                        error={rowErrors[row.id]?.description}
                      />
                      <Input
                        value={row.quantity}
                        onChange={(e) => { updateRow(row.id, 'quantity', e.target.value); setRowErrors((prev) => { const n = { ...prev }; if (n[row.id]) delete n[row.id].quantity; return n; }); }}
                        placeholder={t('donation.quantity_placeholder')}
                        error={rowErrors[row.id]?.quantity}
                      />
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" type="button" onClick={addRow} className="w-full">
                  <Plus className="w-4 h-4" />
                  {t('donation.add_product')}
                </Button>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    {t('donation.additional_note')} <span className="text-muted-foreground font-normal">{t('common.optional')}</span>
                  </label>
                  <textarea
                    value={donateNote}
                    onChange={(e) => setDonateNote(e.target.value)}
                    rows={2}
                    placeholder={t('donation.additional_note_placeholder')}
                    className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                {donateError && <p className="text-sm text-destructive">{donateError}</p>}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1"
                    onClick={handleSubmitDonation}
                    disabled={donateLoading}
                  >
                    <Heart className="w-4 h-4" />
                    {donateLoading ? t('common.loading') : t('donation.confirm_donation')}
                  </Button>
                  <Button variant="outline" onClick={() => setDonateCampaign(null)}>{t('common.cancel')}</Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
