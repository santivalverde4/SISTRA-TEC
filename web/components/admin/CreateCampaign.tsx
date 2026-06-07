'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { DateInput } from '@/components/ui-custom/DateInput';
import { ContextHelp } from '@/components/ui-custom/ContextHelp';
import { FieldExplanation } from '@/components/ui-custom/FieldExplanation';
import { ConstructiveError } from '@/components/ui-custom/ConstructiveError';
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

    if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres para dar suficiente contexto';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'La descripción no puede exceder 1000 caracteres';
    }
    if (!formData.startDate) newErrors.startDate = 'Debes seleccionar una fecha de inicio';
    if (!formData.endDate) newErrors.endDate = 'Debes seleccionar una fecha de finalización';
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      newErrors.endDate = 'La fecha de fin debe ser después de la fecha de inicio';
    }
    if (formData.categories.length === 0) newErrors.categories = 'Debes seleccionar al menos una categoría';

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

      <FieldExplanation text="Una campaña ayuda a coordinar la recolección de donaciones. Sé específico sobre qué necesitas, cuándo y por qué, para que los donantes y transportistas entiendan claramente el objetivo." />

      {submitError && (
        <ConstructiveError 
          error={submitError}
          suggestion="Verifica todos los campos y asegúrate de que los datos sean válidos"
        />
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 font-medium">
                  {t('campaign.name')}
                  <ContextHelp 
                    text="Dale un nombre descriptivo pero conciso. Ejemplo: 'Ayuda para familias afectadas por la inundación de barrio X' o 'Campaña de vacunación para menores'"
                    title="¿Cómo nombrar una campaña?"
                  />
                </label>
                <span className={`text-xs ${formData.name.length > 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.name.length}/100
                </span>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors((prev) => ({ ...prev, name: '' })); }}
                placeholder="Ej: Ayuda de emergencia 2024"
                error={errors.name}
              />
              <FieldExplanation text="Esto es lo primero que ven los donantes. Sé claro sobre QUÉ y POR QUÉ." />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="flex items-center gap-2 font-medium">
                  {t('campaign.description')}
                  <ContextHelp 
                    text="Explica en detalle: qué necesitas, para quién es, en qué condiciones se distribuirá, qué impacto tendrá. Sé empático pero realista."
                    title="¿Qué incluir en la descripción?"
                  />
                </label>
                <span className={`text-xs ${formData.description.length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formData.description.length}/1000
                </span>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setErrors((prev) => ({ ...prev, description: '' })); }}
                placeholder="Describe la necesidad, quiénes se beneficiarán y cómo se distribuirán las donaciones..."
                rows={4}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.description && (
                <ConstructiveError 
                  error={errors.description}
                  suggestion="Describe el problema y el impacto: qué necesitas, cuándo y por qué es importante"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  {t('campaign.start_date')}
                  <ContextHelp 
                    text="Fecha en que la campaña comienza a recibir donaciones. Debe ser hoy o después."
                    title="¿Cuándo comenzar?"
                  />
                </label>
                <DateInput
                  value={formData.startDate}
                  onChange={(v) => { setFormData({ ...formData, startDate: v }); setErrors((prev) => ({ ...prev, startDate: '' })); }}
                  min={today}
                  max={formData.endDate || undefined}
                  error={errors.startDate}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  {t('campaign.end_date')}
                  <ContextHelp 
                    text="Fecha en que la campaña cierra y deja de recibir donaciones. Debe ser después de la fecha de inicio."
                    title="¿Cuándo finalizar?"
                  />
                </label>
                <DateInput
                  value={formData.endDate}
                  onChange={(v) => { setFormData({ ...formData, endDate: v }); setErrors((prev) => ({ ...prev, endDate: '' })); }}
                  min={formData.startDate ? nextDay(formData.startDate) : nextDay(today)}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                {t('campaign.categories')}
                <ContextHelp 
                  text="Selecciona las categorías que mejor describen lo que necesitas. Los donantes pueden filtrar por estas categorías."
                  title="¿Cómo usar categorías?"
                />
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
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
                <ConstructiveError 
                  error={errors.categories}
                  suggestion="Selecciona al menos una categoría para que los donantes puedan encontrar tu campaña más fácilmente"
                />
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
