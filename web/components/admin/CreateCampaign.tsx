'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { DateInput } from '@/components/ui-custom/DateInput';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '@/lib/i18n/useT';
import { createCampaign } from '@/services/campaignService';
import { resolveErrorKey } from '@/lib/apiError';

const categoryOptions = ['Alimentos', 'Ropa', 'Medicamentos', 'Suministros', 'Educación', 'Vivienda', 'Otro'];

const nextDay = (date: string): string => {
  // Parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  return next.toLocaleDateString('en-CA');
};

export const CreateCampaign = () => {
  const router = useRouter();
  const { t } = useT();
  const today = new Date().toLocaleDateString('en-CA');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    categories: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.startDate !== '' &&
    formData.endDate !== '' &&
    formData.endDate > formData.startDate &&
    formData.categories.length > 0;

  const toggleCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('campaign.error_name_required');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = t('campaign.error_name_min');
    } else if (formData.name.trim().length > 100) {
      newErrors.name = t('campaign.error_name_max');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('campaign.error_description_required');
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t('campaign.error_description_min');
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = t('campaign.error_description_max');
    }
    if (!formData.startDate) newErrors.startDate = t('campaign.error_start_required');
    if (!formData.endDate) newErrors.endDate = t('campaign.error_end_required');
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = t('campaign.error_end_before_start');
    }
    if (formData.categories.length === 0) newErrors.categories = t('campaign.error_categories_required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    try {
      await createCampaign({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        categories: formData.categories,
      });
      router.push('/dashboard/admin/campaigns');
    } catch (err) {
      setSubmitError(t(resolveErrorKey(err, 'campaign') as Parameters<typeof t>[0]));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1>{t('campaign.create_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('campaign.create_subtitle')}</p>
      </div>

      {submitError && (
        <p className="mb-4 text-sm text-destructive">{submitError}</p>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label>{t('campaign.name')}</label>
                <span className={`text-xs ${formData.name.length > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.name.length}/100
                </span>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('campaign.name_placeholder')}
                error={errors.name}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label>{t('campaign.description')}</label>
                <span className={`text-xs ${formData.description.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.description.length}/1000
                </span>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('campaign.description_placeholder')}
                rows={4}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">{t('campaign.start_date')}</label>
                <DateInput
                  value={formData.startDate}
                  onChange={(v) => setFormData({ ...formData, startDate: v })}
                  min={today}
                  max={formData.endDate || undefined}
                  error={errors.startDate}
                />
              </div>
              <div>
                <label className="block mb-2">{t('campaign.end_date')}</label>
                <DateInput
                  value={formData.endDate}
                  onChange={(v) => setFormData({ ...formData, endDate: v })}
                  min={formData.startDate ? nextDay(formData.startDate) : nextDay(today)}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">{t('campaign.categories')}</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={clsx(
                      'px-4 py-2 rounded-lg border transition-all',
                      formData.categories.includes(category)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-2 text-sm text-destructive">{errors.categories}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || !isFormValid}>
                <Plus className="w-4 h-4" />
                {loading ? t('common.loading') : t('campaign.create_button')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/campaigns')}
              >
                {t('common.back_to_management')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
