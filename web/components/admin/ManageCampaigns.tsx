'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { StatusBadge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { Search, Filter, Edit, Trash2, Plus, MoreVertical, Truck, Calendar, Package, Tag, MapPin, Route } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
import type { Campaign, CampaignStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { DateInput } from '@/components/ui-custom/DateInput';

interface Assignment {
  transportistaId: string;
  destination: string;
  km: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Ayuda para comunidades afectadas por inundaciones',
    description: 'Recolección de alimentos y suministros básicos',
    status: 'abierta',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    donationsCount: 45,
    categories: ['Alimentos', 'Suministros'],
  },
  {
    id: '2',
    name: 'Medicamentos para zonas rurales',
    description: 'Provisión de medicamentos esenciales',
    status: 'cerrada',
    startDate: '2026-04-15',
    endDate: '2026-05-15',
    donationsCount: 32,
    categories: ['Medicamentos'],
  },
  {
    id: '3',
    name: 'Ropa de invierno para refugiados',
    description: 'Donación de ropa abrigada',
    status: 'en-camino',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    donationsCount: 78,
    categories: ['Ropa'],
  },
];

const mockTransportistas = [
  { id: 't1', name: 'Carlos Méndez', vehicle: 'Camión 3.5t' },
  { id: 't2', name: 'Laura Soto', vehicle: 'Furgoneta' },
  { id: 't3', name: 'Roberto Díaz', vehicle: 'Camión 7t' },
  { id: 't4', name: 'Ana Flores', vehicle: 'Pickup' },
];

export const ManageCampaigns = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});

  const [editTarget, setEditTarget] = useState<Campaign | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<Campaign | null>(null);
  const [editForm, setEditForm] = useState<Campaign | null>(null);
  const [assignTarget, setAssignTarget] = useState<Campaign | null>(null);
  const [assignForm, setAssignForm] = useState<Assignment>({ transportistaId: '', destination: '', km: '' });

  const openEdit = (c: Campaign) => {
    setEditTarget(c);
    setEditForm({ ...c });
  };

  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const saveEdit = () => {
    if (!editForm) return;
    const errs: Record<string, string> = {};
    if (!editForm.startDate) errs.startDate = 'La fecha de inicio es requerida';
    if (!editForm.endDate) errs.endDate = 'La fecha de fin es requerida';
    if (editForm.startDate && editForm.endDate && editForm.startDate > editForm.endDate) {
      errs.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setCampaigns(prev => prev.map(c => c.id === editForm.id ? editForm : c));
    setEditTarget(null);
    setEditForm(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCampaigns(prev => prev.filter(c => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openAssign = (c: Campaign) => {
    setAssignTarget(c);
    setAssignForm(assignments[c.id] ?? { transportistaId: '', destination: '', km: '' });
  };

  const saveAssignment = () => {
    if (!assignTarget || !assignForm.transportistaId || !assignForm.destination || !assignForm.km) return;
    setAssignments(prev => ({ ...prev, [assignTarget.id]: assignForm }));
    setAssignTarget(null);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1>Gestión de Campañas</h1>
          <p className="text-muted-foreground mt-1">
            Administra y monitorea todas las campañas activas
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/admin/campaigns/create')}>
          <Plus className="w-4 h-4" />
          Nueva Campaña
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
                placeholder="Buscar campañas..."
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
                <option value="all">Todos los estados</option>
                <option value="abierta">Abierta</option>
                <option value="congelada">Congelada</option>
                <option value="cerrada">Cerrada</option>
                <option value="en-camino">En camino</option>
                <option value="entregada">Entregada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => {
          const asgn = assignments[campaign.id];
          const transportista = asgn ? mockTransportistas.find(t => t.id === asgn.transportistaId) : null;
          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate mb-1">{campaign.name}</h3>
                    <StatusBadge status={campaign.status} />
                    <p className="text-muted-foreground mt-2 mb-3">{campaign.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{campaign.donationsCount} donaciones</span>
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{campaign.categories.join(', ')}</span>
                    </div>
                    {transportista && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Truck className="w-4 h-4" />
                          {transportista.name} · {transportista.vehicle}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{asgn.destination}</span>
                        <span className="flex items-center gap-1 text-muted-foreground"><Route className="w-3.5 h-3.5" />{asgn.km} km</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 sm:flex-row sm:gap-2">
                    <Button variant="outline" size="sm" onClick={() => openAssign(campaign)} title="Asignar transportista">
                      <Truck className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(campaign)} title="Editar">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget(campaign)} title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDetailsTarget(campaign)} title="Ver detalles">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron campañas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Asignar Transportista */}
      {assignTarget && (
        <Modal title="Asignar Transportista" onClose={() => setAssignTarget(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Campaña: <span className="font-medium text-foreground">{assignTarget.name}</span></p>
            <div>
              <label className="block mb-1 text-sm font-medium">Transportista</label>
              <select
                value={assignForm.transportistaId}
                onChange={(e) => setAssignForm({ ...assignForm, transportistaId: e.target.value })}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar transportista...</option>
                {mockTransportistas.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.vehicle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Destino</label>
              <Input
                value={assignForm.destination}
                onChange={(e) => setAssignForm({ ...assignForm, destination: e.target.value })}
                placeholder="Ej: Comunidad San Juan, Zona Norte"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Distancia (km)</label>
              <Input
                type="number"
                min="0"
                value={assignForm.km}
                onChange={(e) => setAssignForm({ ...assignForm, km: e.target.value })}
                placeholder="Ej: 120"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancelar</Button>
              <Button
                onClick={saveAssignment}
                disabled={!assignForm.transportistaId || !assignForm.destination || !assignForm.km}
              >
                Asignar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Editar */}
      {editTarget && editForm && (
        <Modal title="Editar Campaña" onClose={() => { setEditTarget(null); setEditForm(null); setEditErrors({}); }}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Nombre</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Descripción</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Fecha inicio</label>
                <DateInput
                  value={editForm.startDate}
                  onChange={(v) => setEditForm({ ...editForm, startDate: v })}
                  min={today}
                  max={editForm.endDate || undefined}
                  error={editErrors.startDate}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Fecha fin</label>
                <DateInput
                  value={editForm.endDate}
                  onChange={(v) => setEditForm({ ...editForm, endDate: v })}
                  min={editForm.startDate || today}
                  error={editErrors.endDate}
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Estado</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CampaignStatus })}
                className="w-full px-3 py-2 bg-input-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="abierta">Abierta</option>
                <option value="congelada">Congelada</option>
                <option value="cerrada">Cerrada</option>
                <option value="en-camino">En camino</option>
                <option value="entregada">Entregada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setEditTarget(null); setEditForm(null); setEditErrors({}); }}>
                Cancelar
              </Button>
              <Button onClick={saveEdit}>Guardar cambios</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar */}
      {deleteTarget && (
        <Modal title="Eliminar Campaña" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              ¿Confirmas que deseas eliminar la campaña{' '}
              <span className="font-semibold text-foreground">"{deleteTarget.name}"</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detalles */}
      {detailsTarget && (
        <Modal title="Detalles de Campaña" onClose={() => setDetailsTarget(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="flex-1">{detailsTarget.name}</h3>
              <StatusBadge status={detailsTarget.status} />
            </div>
            <p className="text-muted-foreground">{detailsTarget.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Fecha inicio</p>
                <p className="font-medium">{formatDate(detailsTarget.startDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Fecha fin</p>
                <p className="font-medium">{formatDate(detailsTarget.endDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Donaciones</p>
                <p className="font-medium">{detailsTarget.donationsCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Categorías</p>
                <p className="font-medium">{detailsTarget.categories.join(', ')}</p>
              </div>
            </div>
            {assignments[detailsTarget.id] && (() => {
              const asgn = assignments[detailsTarget.id];
              const t = mockTransportistas.find(t => t.id === asgn.transportistaId);
              return (
                <div className="border border-border rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-medium text-foreground flex items-center gap-2"><Truck className="w-4 h-4" /> Asignación de transporte</p>
                  <p className="text-muted-foreground">Transportista: <span className="text-foreground font-medium">{t?.name} — {t?.vehicle}</span></p>
                  <p className="text-muted-foreground">Destino: <span className="text-foreground font-medium">{asgn.destination}</span></p>
                  <p className="text-muted-foreground">Distancia: <span className="text-foreground font-medium">{asgn.km} km</span></p>
                </div>
              );
            })()}
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => { setDetailsTarget(null); openAssign(detailsTarget); }}>
                <Truck className="w-4 h-4" />
                Asignar
              </Button>
              <Button variant="outline" onClick={() => { setDetailsTarget(null); openEdit(detailsTarget); }}>
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => { setDetailsTarget(null); setDeleteTarget(detailsTarget); }} className="text-destructive border-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
              <Button onClick={() => setDetailsTarget(null)}>Cerrar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
