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

const categoryOptions = ['Alimentos', 'Ropa', 'Medicamentos', 'Suministros', 'Educación', 'Vivienda', 'Otro'];

const today = new Date().toISOString().split('T')[0];

export const CreateCampaign = () => {
  const router = useRouter();
  const { t } = useT();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    banner: '',
    categories: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = t('campaign.error_name_required');
    if (!formData.description) newErrors.description = t('campaign.error_description_required');
    if (!formData.startDate) newErrors.startDate = t('campaign.error_start_required');
    if (!formData.endDate) newErrors.endDate = t('campaign.error_end_required');
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = t('campaign.error_end_before_start');
    }
    if (formData.categories.length === 0) newErrors.categories = t('campaign.error_categories_required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push('/dashboard/admin/campaigns');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1>{t('campaign.create_title')}</h1>
        <p className="text-muted-foreground mt-1">{t('campaign.create_subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div>
              <label className="block mb-2">{t('campaign.name')}</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('campaign.name_placeholder')}
                error={errors.name}
              />
            </div>

            <div>
              <label className="block mb-2">{t('campaign.description')}</label>
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

            <div className="grid grid-cols-2 gap-4">
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
                  min={formData.startDate || today}
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
              <Button type="submit">
                <Plus className="w-4 h-4" />
                {t('campaign.create_button')}
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
