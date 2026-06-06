'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui-custom/Card';
import { Button } from '@/components/ui-custom/Button';
import { Input } from '@/components/ui-custom/Input';
import { Badge } from '@/components/ui-custom/Badge';
import { Modal } from '@/components/shared/Modal';
import { User, Mail, Shield, Truck } from 'lucide-react';
import { PasswordInput } from '@/components/ui-custom/PasswordInput';
import { getRole } from '@/lib/auth';
import { resolveErrorKey } from '@/lib/apiError';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';
import {
  getProfile,
  updateProfile,
  changePassword,
  getMyVehicle,
  updateMyVehicle,
  type ProfileData,
  type VehicleData,
} from '@/services/profileService';

export const Profile = () => {
  const { t } = useT();
  const userRole = (getRole() ?? 'donante') as UserRole;

  const roleLabels: Record<UserRole, string> = {
    donante: t('profile.role_donante'),
    transportista: t('profile.role_transportista'),
    administrador: t('profile.role_administrador'),
  };

  // --- Profile state ---
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', hasPassword: true });
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // --- Password state ---
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // --- Vehicle state (transportista only) ---
  const [vehicle, setVehicle] = useState<VehicleData>({ vehicle: '', plate: '' });
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleData>({ vehicle: '', plate: '' });
  const [vehicleErrors, setVehicleErrors] = useState({ vehicle: '', plate: '' });
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleSuccess, setVehicleSuccess] = useState('');
  const [vehicleError, setVehicleError] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setNameInput(data.name);
      })
      .catch(() => setProfileError(t('errors.load_failed')))
      .finally(() => setProfileLoading(false));

    if (userRole === 'transportista') {
      getMyVehicle()
        .then(setVehicle)
        .catch(() => {});
    }
  }, [userRole, t]);

  // --- Profile handlers ---
  const validateName = (value: string) => {
    if (!value.trim()) return t('profile.error_name_required');
    if (value.trim().length < 2) return t('profile.error_name_min');
    return '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateName(nameInput);
    if (err) { setNameError(err); return; }

    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      await updateProfile({ name: nameInput.trim() });
      setProfile((prev) => ({ ...prev, name: nameInput.trim() }));
      setIsEditing(false);
      setProfileSuccess(t('profile.save_success'));
    } catch (err) {
      setProfileError(t(resolveErrorKey(err, 'profile')));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNameInput(profile.name);
    setNameError('');
    setProfileError('');
    setIsEditing(false);
  };

  // --- Password handlers ---
  const validatePassword = () => {
    const errors = { current: '', newPass: '', confirm: '' };
    if (profile.hasPassword && !passwordData.current) errors.current = t('profile.error_current_password_required');
    if (passwordData.newPass.length < 6) errors.newPass = t('profile.error_new_password_min');
    if (passwordData.newPass !== passwordData.confirm) errors.confirm = t('profile.error_passwords_mismatch');
    return errors;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validatePassword();
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await changePassword(passwordData.newPass, profile.hasPassword ? passwordData.current : undefined);
      setPasswordSuccess(t('profile.password_success'));
      setShowPasswordForm(false);
      setPasswordData({ current: '', newPass: '', confirm: '' });
      // After creating a password for OAuth account, mark as having password
      if (!profile.hasPassword) setProfile((prev) => ({ ...prev, hasPassword: true }));
    } catch (err) {
      setPasswordError(t(resolveErrorKey(err, 'profile')));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({ current: '', newPass: '', confirm: '' });
    setPasswordErrors({ current: '', newPass: '', confirm: '' });
    setPasswordError('');
    setShowPasswordForm(false);
  };

  // --- Vehicle handlers ---
  const validateVehicle = () => {
    const errors = { vehicle: '', plate: '' };
    if (!vehicleForm.vehicle.trim()) errors.vehicle = t('profile.error_vehicle_required');
    if (!vehicleForm.plate.trim()) errors.plate = t('profile.error_plate_required');
    return errors;
  };

  const handleSaveVehicle = async () => {
    const errors = validateVehicle();
    setVehicleErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setVehicleSaving(true);
    setVehicleError('');
    setVehicleSuccess('');
    try {
      await updateMyVehicle({ vehicle: vehicleForm.vehicle.trim(), plate: vehicleForm.plate.trim() });
      setVehicle({ vehicle: vehicleForm.vehicle.trim(), plate: vehicleForm.plate.trim() });
      setVehicleSuccess(t('profile.vehicle_success'));
      setShowVehicleModal(false);
    } catch (err) {
      setVehicleError(t(resolveErrorKey(err, 'profile')));
    } finally {
      setVehicleSaving(false);
    }
  };

  if (profileLoading) {
    return <div className="p-6 text-center py-16 text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1>{t('profile.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Personal info */}
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
                    <h3>{profile.name || profile.email}</h3>
                    <Badge variant="info" className="mt-1">
                      <Shield className="w-3 h-3 mr-1" />
                      {roleLabels[userRole]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">{t('profile.full_name')}</label>
                  <Input
                    value={nameInput}
                    onChange={(e) => { setNameInput(e.target.value); setNameError(''); }}
                    disabled={!isEditing}
                    error={nameError}
                  />
                </div>

                <div>
                  <label className="block mb-2">{t('profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={profile.email} disabled className="pl-10" />
                  </div>
                </div>

                {profileError && <p className="text-sm text-destructive">{profileError}</p>}
                {profileSuccess && <p className="text-sm text-[var(--success)]">{profileSuccess}</p>}

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={profileSaving}>
                      {profileSaving ? t('common.loading') : t('profile.save_changes')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      {t('profile.cancel')}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3>{t('profile.security')}</h3>
                {!showPasswordForm && (
                  <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                    {profile.hasPassword ? t('profile.change_password') : t('profile.create_password')}
                  </Button>
                )}
              </div>
            </CardHeader>
            {showPasswordForm && (
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {!profile.hasPassword && (
                    <p className="text-sm text-muted-foreground">{t('profile.oauth_password_hint')}</p>
                  )}

                  {profile.hasPassword && (
                    <div>
                      <label className="block mb-2">{t('profile.current_password')}</label>
                      <PasswordInput
                        value={passwordData.current}
                        onChange={(e) => { setPasswordData({ ...passwordData, current: e.target.value }); setPasswordErrors({ ...passwordErrors, current: '' }); }}
                        placeholder="••••••••"
                        error={passwordErrors.current}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block mb-2">{t('profile.new_password')}</label>
                    <PasswordInput
                      value={passwordData.newPass}
                      onChange={(e) => { setPasswordData({ ...passwordData, newPass: e.target.value }); setPasswordErrors({ ...passwordErrors, newPass: '' }); }}
                      placeholder="••••••••"
                      error={passwordErrors.newPass}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">{t('profile.confirm_new_password')}</label>
                    <PasswordInput
                      value={passwordData.confirm}
                      onChange={(e) => { setPasswordData({ ...passwordData, confirm: e.target.value }); setPasswordErrors({ ...passwordErrors, confirm: '' }); }}
                      placeholder="••••••••"
                      error={passwordErrors.confirm}
                    />
                  </div>

                  {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
                  {passwordSuccess && <p className="text-sm text-[var(--success)]">{passwordSuccess}</p>}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={passwordSaving}>
                      {passwordSaving ? t('common.loading') : t('profile.update_password')}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelPassword}>
                      {t('profile.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Vehicle (transportista only) */}
          {userRole === 'transportista' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3>{t('profile.vehicle_info')}</h3>
                  <Button variant="outline" onClick={() => { setVehicleForm(vehicle); setVehicleErrors({ vehicle: '', plate: '' }); setVehicleError(''); setShowVehicleModal(true); }}>
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
                      <p className="font-medium">{vehicle.vehicle || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">{t('transporters.plate')}</p>
                      <p className="font-medium">{vehicle.plate || '—'}</p>
                    </div>
                  </div>
                </div>
                {vehicleSuccess && <p className="text-sm text-[var(--success)] mt-3">{vehicleSuccess}</p>}
              </CardContent>
            </Card>
          )}

          {/* Role */}
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
                <p className="text-sm text-muted-foreground mt-3">{t('profile.role_description')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vehicle modal */}
      {showVehicleModal && (
        <Modal title={t('profile.vehicle_info')} onClose={() => setShowVehicleModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">{t('profile.vehicle_type')}</label>
              <Input
                value={vehicleForm.vehicle}
                onChange={(e) => { setVehicleForm({ ...vehicleForm, vehicle: e.target.value }); setVehicleErrors({ ...vehicleErrors, vehicle: '' }); }}
                placeholder={t('profile.vehicle_placeholder')}
                error={vehicleErrors.vehicle}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">{t('transporters.plate')}</label>
              <Input
                value={vehicleForm.plate}
                onChange={(e) => { setVehicleForm({ ...vehicleForm, plate: e.target.value }); setVehicleErrors({ ...vehicleErrors, plate: '' }); }}
                placeholder={t('profile.plate_placeholder')}
                error={vehicleErrors.plate}
              />
            </div>

            {vehicleError && <p className="text-sm text-destructive">{vehicleError}</p>}

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleSaveVehicle} disabled={vehicleSaving}>
                {vehicleSaving ? t('common.loading') : t('profile.save')}
              </Button>
              <Button variant="outline" onClick={() => setShowVehicleModal(false)}>
                {t('profile.cancel')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
