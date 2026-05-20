import { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { User, Mail, Lock, Shield, Truck, X } from 'lucide-react';

type UserRole = 'donante' | 'transportista' | 'administrador';

const roleLabels: Record<UserRole, string> = {
  donante: 'Donante',
  transportista: 'Transportista',
  administrador: 'Administrador',
};

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const userRole = (localStorage.getItem('userRole') || 'donante') as UserRole;

  const [formData, setFormData] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+506 8888-8888',
    address: 'San José, Costa Rica',
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleData, setVehicleData] = useState({ vehicle: 'Camión 3.5t', plate: 'ABC-1234' });
  const [vehicleForm, setVehicleForm] = useState(vehicleData);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPasswordForm(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  return (
    <>
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1>Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Administra tu información personal y preferencias
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Información Personal</h3>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3>{formData.name}</h3>
                  <Badge variant="info" className="mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {roleLabels[userRole]}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block mb-2">Nombre Completo</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">Teléfono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block mb-2">Dirección</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button type="submit">Guardar Cambios</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>Seguridad</h3>
              {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  Cambiar Contraseña
                </Button>
              )}
            </div>
          </CardHeader>
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block mb-2">Contraseña Actual</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Actualizar Contraseña</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {userRole === 'transportista' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3>Información del Vehículo</h3>
                <Button variant="outline" onClick={() => { setVehicleForm(vehicleData); setShowVehicleModal(true); }}>
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-6 text-sm flex-1">
                  <div>
                    <p className="text-muted-foreground mb-1">Vehículo</p>
                    <p className="font-medium">{vehicleData.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Placa</p>
                    <p className="font-medium">{vehicleData.plate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h3>Rol del Usuario</h3>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">Tu rol actual en el sistema:</p>
              <Badge variant="info" className="text-base px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                {roleLabels[userRole]}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                El rol determina las funciones y permisos disponibles en el sistema.
                Contacta al administrador para cambiar tu rol.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Información del Vehículo</h2>
              <button onClick={() => setShowVehicleModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Tipo de vehículo</label>
                <Input
                  value={vehicleForm.vehicle}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle: e.target.value })}
                  placeholder="Ej: Camión 3.5t, Furgoneta, Pickup..."
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Placa</label>
                <Input
                  value={vehicleForm.plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                  placeholder="Ej: ABC-1234"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => { setVehicleData(vehicleForm); setShowVehicleModal(false); }}
                  disabled={!vehicleForm.vehicle || !vehicleForm.plate}
                >
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setShowVehicleModal(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
