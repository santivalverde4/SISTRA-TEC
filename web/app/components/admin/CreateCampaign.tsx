import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../Input';
import { Button } from '../Button';
import { Card, CardHeader, CardContent } from '../Card';
import { Plus, X } from 'lucide-react';

const categoryOptions = ['Alimentos', 'Ropa', 'Medicamentos', 'Suministros', 'Educación', 'Vivienda', 'Otro'];

export const CreateCampaign = () => {
  const navigate = useNavigate();
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

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.description) newErrors.description = 'La descripción es requerida';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';
    if (formData.categories.length === 0) newErrors.categories = 'Selecciona al menos una categoría';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    navigate('/gestion-campanas');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1>Crear Nueva Campaña</h1>
        <p className="text-muted-foreground mt-1">
          Configura una nueva campaña de ayuda humanitaria
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="space-y-6">
            <div>
              <label className="block mb-2">Nombre de la Campaña</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Ayuda para comunidades afectadas"
                error={errors.name}
              />
            </div>

            <div>
              <label className="block mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el propósito y objetivos de la campaña..."
                rows={4}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Fecha de Inicio</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  error={errors.startDate}
                />
              </div>
              <div>
                <label className="block mb-2">Fecha de Fin</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Categorías</label>
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
                Crear Campaña
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/gestion-campanas')}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

function clsx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}
