import { useState } from 'react';
import { Card, CardContent } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { StatusBadge } from '../Badge';
import { Search, Package, X, Calendar } from 'lucide-react';

type CampaignStatus = 'abierta' | 'congelada' | 'cerrada' | 'en-camino' | 'entregada' | 'finalizada';

interface DonationItem {
  description: string;
  quantity: string;
}

interface Donation {
  id: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  items: DonationItem[];
  note: string;
  date: string;
}

const mockDonations: Donation[] = [
  {
    id: '1',
    campaignName: 'Ayuda para comunidades afectadas por inundaciones',
    campaignStatus: 'abierta',
    items: [
      { description: 'Arroz', quantity: '10 kg' },
      { description: 'Frijoles', quantity: '5 kg' },
      { description: 'Aceite', quantity: '3 litros' },
    ],
    note: 'Productos en buen estado, empacados.',
    date: '2026-05-08',
  },
  {
    id: '2',
    campaignName: 'Ropa de invierno para refugiados',
    campaignStatus: 'en-camino',
    items: [
      { description: 'Chaquetas talla M', quantity: '8 prendas' },
      { description: 'Suéteres talla L', quantity: '7 prendas' },
    ],
    note: '',
    date: '2026-05-09',
  },
];

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

export const MyDonations = () => {
  const [donations] = useState<Donation[]>(mockDonations);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsDonation, setDetailsDonation] = useState<Donation | null>(null);

  const filteredDonations = donations.filter((d) =>
    d.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>Mis Donaciones</h1>
        <p className="text-muted-foreground mt-1">
          Historial de tus donaciones realizadas
        </p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de campaña..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredDonations.map((donation) => (
          <Card key={donation.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <h4 className="flex-1">{donation.campaignName}</h4>
                      <StatusBadge status={donation.campaignStatus} />
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{donation.items.length} {donation.items.length === 1 ? 'artículo' : 'artículos'}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{donation.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDetailsDonation(donation)}>
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDonations.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tienes donaciones registradas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {detailsDonation && (
        <Modal title="Detalle de Donación" onClose={() => setDetailsDonation(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Campaña</p>
              <p className="font-medium">{detailsDonation.campaignName}</p>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-muted-foreground">Fecha</p>
                <p className="font-medium">{detailsDonation.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Estado campaña</p>
                <StatusBadge status={detailsDonation.campaignStatus} />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-[1fr_120px] gap-2 text-sm font-medium text-muted-foreground px-1 mb-2">
                <span>Producto / Descripción</span>
                <span>Cantidad</span>
              </div>
              <div className="space-y-2">
                {detailsDonation.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_120px] gap-2 text-sm px-1 py-2 border-b border-border last:border-0">
                    <span>{item.description}</span>
                    <span className="text-muted-foreground">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {detailsDonation.note && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nota</p>
                <p className="text-sm bg-secondary/50 rounded-lg px-3 py-2">{detailsDonation.note}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailsDonation(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
