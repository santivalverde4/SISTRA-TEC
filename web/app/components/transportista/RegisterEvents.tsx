import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Badge } from '../Badge';
import { Plus, FileText, Clock } from 'lucide-react';

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
          <h1>Registro de Eventos Logísticos</h1>
          <p className="text-muted-foreground mt-1">
            Documenta cada paso del proceso de entrega
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" />
          Nuevo Evento
        </Button>
      </div>

      <Card className="mb-6 bg-accent/30 border-accent">
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              ℹ️
            </div>
            <div className="flex-1">
              <h4 className="mb-1">Importante</h4>
              <p className="text-sm text-muted-foreground">
                Los eventos logísticos NO cambian automáticamente el estado de la campaña.
                Debes registrar al menos un evento antes de marcar una campaña como entregada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h3>Registrar Nuevo Evento</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2">Campaña</label>
                <select
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Selecciona una campaña</option>
                  <option value="Medicamentos para zonas rurales">Medicamentos para zonas rurales</option>
                  <option value="Alimentos para damnificados">Alimentos para damnificados</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Tipo de Evento</label>
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
                <label className="block mb-2">Descripción del Evento</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe lo que ocurrió"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Notas Logísticas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información adicional, observaciones..."
                  rows={3}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Registrar Evento</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Historial de Eventos
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
                    <Badge variant="info">Logístico</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">{event.description}</p>
                  {event.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mb-2">
                      📝 {event.notes}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📅 {event.date}</span>
                    <span>🕐 {event.time}</span>
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
