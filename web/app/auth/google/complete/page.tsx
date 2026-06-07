'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCircle, Truck } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { completeGoogleAuth } from '@/services/authService';
import { getDefaultRoute } from '@/lib/auth';
import { resolveErrorKey } from '@/lib/apiError';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';

export default function GoogleCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();

  const tempToken = searchParams.get('t');

  const [role, setRole] = useState<UserRole>('donante');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [transporterPhone, setTransporterPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [needsRole, setNeedsRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!tempToken) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    // Attempt without role — succeeds if user already has an OAuth account
    completeGoogleAuth(tempToken)
      .then((user) => { window.location.href = getDefaultRoute(user.role); })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '';
        if (msg.includes('Role required')) {
          setNeedsRole(true);
        } else {
          setError(t(resolveErrorKey(err, 'auth') as Parameters<typeof t>[0]));
        }
        setLoading(false);
      });
  }, [tempToken, router, t]);

  async function handleComplete() {
    if (!tempToken) return;

    const newFieldErrors: Record<string, string> = {};
    if (role === 'transportista') {
      if (!vehicle || vehicle.trim().length < 3) newFieldErrors.vehicle = t('auth.error_vehicle_min');
      if (!plate || !/^[A-Za-z0-9]{6,}$/.test(plate.replace(/-/g, ''))) newFieldErrors.plate = t('auth.error_plate_invalid');
      if (!transporterPhone.trim() || transporterPhone.trim().length < 8) newFieldErrors.transporterPhone = t('profile.error_phone_min');
      else if (!/^[+\d\s\-()]{8,}$/.test(transporterPhone.trim())) newFieldErrors.transporterPhone = t('profile.error_phone_invalid');
    }
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError(null);
    try {
      const user = await completeGoogleAuth(tempToken, role, vehicle || undefined, plate || undefined, undefined, undefined, transporterPhone || undefined);
      window.location.href = getDefaultRoute(user.role);
    } catch (err) {
      setError(t(resolveErrorKey(err, 'auth') as Parameters<typeof t>[0]));
      setLoading(false);
    }
  }

  if (!mounted) return null;
  if (!tempToken) return null;
  if (loading && !needsRole) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <h1 className="text-primary">{t('auth.app_title')}</h1>
            <p className="text-muted-foreground">{t('auth.google_complete_subtitle')}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">{t('auth.role')}</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-10 pr-3 py-2 bg-input border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="donante">{t('auth.role_donor')}</option>
                <option value="transportista">{t('auth.role_transporter')}</option>
                <option value="administrador">{t('auth.role_admin')}</option>
              </select>
            </div>
          </div>

          {role === 'transportista' && (
            <>
              <div>
                <label className="block mb-2 text-sm">{t('auth.vehicle')}</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder={t('auth.vehicle_placeholder')}
                    error={fieldErrors.vehicle}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">{t('auth.plate')}</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-[9px] w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder={t('auth.plate_placeholder')}
                    error={fieldErrors.plate}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">{t('auth.transporter_phone')}</label>
                <Input
                  value={transporterPhone}
                  onChange={(e) => setTransporterPhone(e.target.value)}
                  placeholder={t('profile.phone_placeholder')}
                  error={fieldErrors.transporterPhone}
                />
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-3">
          {error && <p className="text-sm text-destructive w-full">{error}</p>}
          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={
              loading ||
              !needsRole ||
              (role === 'transportista' && (!vehicle.trim() || !plate.trim() || transporterPhone.trim().length < 8 || !/^[+\d\s\-()]{8,}$/.test(transporterPhone.trim())))
            }
          >
            {loading ? t('common.loading') : t('auth.google_complete_button')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
