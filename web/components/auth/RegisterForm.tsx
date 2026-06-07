'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, UserCircle, Truck } from 'lucide-react';
import { Input } from '@/components/ui-custom/Input';
import { PasswordInput } from '@/components/ui-custom/PasswordInput';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { getDefaultRoute, isAuthenticated, getRole } from '@/lib/auth';
import { register } from '@/services/authService';
import { resolveErrorKey } from '@/lib/apiError';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';

export function RegisterForm() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRole();
      if (role) router.replace(getDefaultRoute(role));
    }
  }, [router]);
  const { t } = useT();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donante' as UserRole,
    vehicle: '',
    plate: '',
    phone: '',
    address: '',
    transporterPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('auth.error_name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('auth.error_name_min');
    }
    if (!formData.email) {
      newErrors.email = t('auth.error_email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.error_email_invalid');
    }
    if (!formData.password) {
      newErrors.password = t('auth.error_password_required');
    } else if (formData.password.length < 6 || !/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = t('auth.error_password_min');
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.error_passwords_mismatch');
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      newErrors.phone = t('profile.error_phone_min');
    } else if (!/^[+\d\s\-()]{8,}$/.test(formData.phone.trim())) {
      newErrors.phone = t('profile.error_phone_invalid');
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = t('profile.error_address_min');
    }
    if (formData.role === 'transportista') {
      if (!formData.vehicle || formData.vehicle.trim().length < 3) {
        newErrors.vehicle = t('auth.error_vehicle_min');
      }
      if (!formData.plate || !/^[A-Za-z0-9]{6,}$/.test(formData.plate.replace(/-/g, ''))) {
        newErrors.plate = t('auth.error_plate_invalid');
      }
      if (!formData.transporterPhone.trim() || formData.transporterPhone.trim().length < 8) {
        newErrors.transporterPhone = t('profile.error_phone_min');
      } else if (!/^[+\d\s\-()]{8,}$/.test(formData.transporterPhone.trim())) {
        newErrors.transporterPhone = t('profile.error_phone_invalid');
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        vehicle: formData.vehicle || undefined,
        plate: formData.plate || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        transporterPhone: formData.transporterPhone || undefined,
      });
      router.push(getDefaultRoute(user.role));
    } catch (err) {
      setErrors({ general: t(resolveErrorKey(err, 'auth') as Parameters<typeof t>[0]) });
    } finally {
      setLoading(false);
    }
  }

  function field(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="text-center space-y-1">
          <h1 className="text-primary">{t('auth.app_title')}</h1>
          <p className="text-muted-foreground text-sm">{t('auth.create_account_subtitle')}</p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">{t('auth.full_name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={formData.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder={t('auth.full_name_placeholder')}
                error={errors.name}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => field('email', e.target.value)}
                placeholder="tu@correo.com"
                error={errors.email}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">{t('auth.role')}</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={formData.role}
                onChange={(e) => field('role', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-input border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="donante">{t('auth.role_donor')}</option>
                <option value="transportista">{t('auth.role_transporter')}</option>
                <option value="administrador">{t('auth.role_admin')}</option>
              </select>
            </div>
          </div>


          <div>
            <label className="block mb-2 text-sm">{t('profile.phone')}</label>
            <Input
              value={formData.phone}
              onChange={(e) => field('phone', e.target.value)}
              placeholder={t('profile.phone_placeholder')}
              error={errors.phone}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">{t('profile.address')}</label>
            <Input
              value={formData.address}
              onChange={(e) => field('address', e.target.value)}
              placeholder={t('profile.address_placeholder')}
              error={errors.address}
            />
          </div>

          {formData.role === 'transportista' && (
            <>
              <div>
                <label className="block mb-2 text-sm">{t('auth.vehicle')}</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={formData.vehicle}
                    onChange={(e) => field('vehicle', e.target.value)}
                    placeholder={t('auth.vehicle_placeholder')}
                    error={errors.vehicle}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">{t('auth.plate')}</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={formData.plate}
                    onChange={(e) => field('plate', e.target.value.toUpperCase())}
                    placeholder={t('auth.plate_placeholder')}
                    error={errors.plate}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">{t('auth.transporter_phone')}</label>
                <Input
                  value={formData.transporterPhone}
                  onChange={(e) => field('transporterPhone', e.target.value)}
                  placeholder={t('profile.phone_placeholder')}
                  error={errors.transporterPhone}
                />
              </div>
            </>
          )}
          <div>
            <label className="block mb-2 text-sm">{t('auth.password')}</label>
            <PasswordInput
              value={formData.password}
              onChange={(e) => field('password', e.target.value)}
              placeholder="••••••••"
              error={errors.password}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">{t('auth.confirm_password')}</label>
            <PasswordInput
              value={formData.confirmPassword}
              onChange={(e) => field('confirmPassword', e.target.value)}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          {errors.general && (
            <p className="text-sm text-destructive w-full">{errors.general}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              formData.name.trim().length < 2 ||
              !formData.email.trim() ||
              !formData.password ||
              !formData.confirmPassword ||
              formData.phone.trim().length < 8 || !/^[+\d\s\-()]{8,}$/.test(formData.phone.trim()) ||
              formData.address.trim().length < 5 ||
              (formData.role === 'transportista' && (!formData.vehicle.trim() || !formData.plate.trim() || formData.transporterPhone.trim().length < 8 || !/^[+\d\s\-()]{8,}$/.test(formData.transporterPhone.trim())))
            }
          >
            {loading ? t('common.loading') : t('auth.register')}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t('auth.has_account')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('auth.login_link')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
