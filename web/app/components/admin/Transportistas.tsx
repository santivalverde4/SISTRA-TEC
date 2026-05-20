import { useState } from 'react';
import { Card, CardContent } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Search, Truck, X, MapPin, Package, Phone, Mail } from 'lucide-react';

interface Assignment {
  campaignName: string;
  destination: string;
  km: string;
  status: 'pendiente' | 'en-camino' | 'entregada' | 'finalizada';
}

interface Transportista {
  id: string;
  name: string;
  vehicle: string;
  plate: string;
  phone: string;
  email: string;
  assignments: Assignment[];
}

const mockTransportistas: Transportista[] = [
  {
    id: 't1',
    name: 'Carlos Méndez',
    vehicle: 'Camión 3.5t',
    plate: 'ABC-1234',
    phone: '+506 8800-0001',
    email: 'carlos.mendez@sistra.com',
    assignments: [
      {
        campaignName: 'Ropa de invierno para refugiados',
        destination: 'Comunidad San Juan, Zona Norte',
        km: '120',
        status: 'en-camino',
      },
    ],
  },
  {
    id: 't2',
    name: 'Laura Soto',
    vehicle: 'Furgoneta',
    plate: 'DEF-5678',
    phone: '+506 8800-0002',
    email: 'laura.soto@sistra.com',
    assignments: [
      {
        campaignName: 'Medicamentos para zonas rurales',
        destination: 'Centro de Salud Rural, Zona Sur',
        km: '85',
        status: 'pendiente',
      },
    ],
  },
  {
    id: 't3',
    name: 'Roberto Díaz',
    vehicle: 'Camión 7t',
    plate: 'GHI-9012',
    phone: '+506 8800-0003',
    email: 'roberto.diaz@sistra.com',
    assignments: [],
  },
  {
    id: 't4',
    name: 'Ana Flores',
    vehicle: 'Pickup',
    plate: 'JKL-3456',
    phone: '+506 8800-0004',
    email: 'ana.flores@sistra.com',
    assignments: [
      {
        campaignName: 'Ayuda para comunidades afectadas por inundaciones',
        destination: 'Aldea Río Verde',
        km: '45',
        status: 'finalizada',
      },
    ],
  },
];

const statusLabel: Record<string, { label: string; classes: string }> = {
  'pendiente': { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-700' },
  'en-camino': { label: 'En camino', classes: 'bg-purple-100 text-purple-700' },
  'entregada': { label: 'Entregada', classes: 'bg-green-100 text-green-700' },
  'finalizada': { label: 'Finalizada', classes: 'bg-gray-100 text-gray-600' },
};

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const Transportistas = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Transportista | null>(null);

  const filtered = mockTransportistas.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>Transportistas</h1>
        <p className="text-muted-foreground mt-1">Lista de transportistas y sus asignaciones</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o vehículo..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filtered.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1">{t.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />{t.vehicle} · {t.plate}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{t.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{t.email}</span>
                    </div>
                    <div className="mt-2">
                      {t.assignments.length === 0 ? (
                        <span className="text-sm text-muted-foreground">Sin asignaciones activas</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {t.assignments.map((a, i) => {
                            const s = statusLabel[a.status];
                            return (
                              <span key={i} className={`text-xs px-2 py-1 rounded-full font-medium ${s.classes}`}>
                                {a.campaignName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelected(t)}>
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron transportistas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selected && (
        <Modal title="Detalle de Transportista" onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3>{selected.name}</h3>
                <p className="text-muted-foreground text-sm">{selected.vehicle} · {selected.plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Teléfono</p>
                <p className="font-medium">{selected.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Correo</p>
                <p className="font-medium">{selected.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vehículo</p>
                <p className="font-medium">{selected.vehicle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Placa</p>
                <p className="font-medium">{selected.plate}</p>
              </div>
            </div>

            {selected.assignments.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Asignación actual</p>
                <div className="space-y-3">
                  {selected.assignments.map((a, i) => {
                    const s = statusLabel[a.status];
                    return (
                      <div key={i} className="border border-border rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium flex-1">{a.campaignName}</p>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${s.classes}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {a.destination}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" /> {a.km} km de recorrido
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selected.assignments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin asignaciones registradas</p>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setSelected(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
