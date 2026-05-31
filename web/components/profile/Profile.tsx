'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Badge } from '@/components/ui-custom/Badge';
import { User, Mail, Lock, Shield, Truck, X } from 'lucide-react';
import { getRole } from '@/lib/auth';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';

export const Profile = () => {
  const { t } = useT();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const userRole = (getRole() ?? 'donante') as UserRole;

  const roleLabels: Record<UserRole, string> = {
    donante: t('profile.role_donante'),
    transportista: t('profile.role_transportista'),
    administrador: t('profile.role_administrador'),
  };

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
        <h1>{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>{t('profile.personal_info')}</h3>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  {t('profile.edit_profile')}
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
                <label className="block mb-2">{t('profile.full_name')}</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block mb-2">{t('profile.email')}</label>
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
                <label className="block mb-2">{t('profile.phone')}</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block mb-2">{t('profile.address')}</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button type="submit">{t('profile.save_changes')}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    {t('profile.cancel')}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3>{t('profile.security')}</h3>
              {!showPasswordForm && (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  {t('profile.change_password')}
                </Button>
              )}
            </div>
          </CardHeader>
          {showPasswordForm && (
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block mb-2">{t('profile.current_password')}</label>
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
                  <label className="block mb-2">{t('profile.new_password')}</label>
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
                  <label className="block mb-2">{t('profile.confirm_new_password')}</label>
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
                  <Button type="submit">{t('profile.update_password')}</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    {t('profile.cancel')}
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
                <h3>{t('profile.vehicle_info')}</h3>
                <Button variant="outline" onClick={() => { setVehicleForm(vehicleData); setShowVehicleModal(true); }}>
                  {t('common.edit')}
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
                    <p className="text-muted-foreground mb-1">{t('transporters.vehicle')}</p>
                    <p className="font-medium">{vehicleData.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">{t('transporters.plate')}</p>
                    <p className="font-medium">{vehicleData.plate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h3>{t('profile.user_role')}</h3>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-muted-foreground mb-2">{t('profile.current_role')}</p>
              <Badge variant="info" className="text-base px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                {roleLabels[userRole]}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                {t('profile.role_description')}
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
              <h2 className="text-lg font-semibold">{t('profile.vehicle_info')}</h2>
              <button onClick={() => setShowVehicleModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">{t('profile.vehicle_type')}</label>
                <Input
                  value={vehicleForm.vehicle}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle: e.target.value })}
                  placeholder={t('profile.vehicle_placeholder')}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">{t('transporters.plate')}</label>
                <Input
                  value={vehicleForm.plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value })}
                  placeholder={t('profile.plate_placeholder')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => { setVehicleData(vehicleForm); setShowVehicleModal(false); }}
                  disabled={!vehicleForm.vehicle || !vehicleForm.plate}
                >
                  {t('profile.save')}
                </Button>
                <Button variant="outline" onClick={() => setShowVehicleModal(false)}>{t('profile.cancel')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
