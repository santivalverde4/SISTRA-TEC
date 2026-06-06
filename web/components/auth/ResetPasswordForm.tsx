'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { PasswordInput } from '@/components/ui-custom/PasswordInput';
import { Button } from '@/components/ui-custom/Button';
import { resetPassword } from '@/services/authService';
import { useT } from '@/lib/i18n/useT';

export function ResetPasswordForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('t') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent>
            <p className="text-center text-destructive py-8">{t('auth.reset_password_invalid_token')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = t('auth.error_password_required');
    } else if (newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      newErrors.newPassword = t('auth.error_password_min');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.error_password_required');
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('auth.error_passwords_mismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 2500);
    } catch {
      setErrors({ general: t('auth.reset_password_invalid_token') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-primary">{t('auth.app_title')}</h1>
            <p className="text-muted-foreground">{t('auth.reset_password_subtitle')}</p>
          </div>
        </CardHeader>

        {success ? (
          <CardContent>
            <p className="text-sm text-center text-muted-foreground py-4">
              {t('auth.reset_password_success')}
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">{t('auth.reset_password_new')}</label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: undefined })); }}
                  placeholder={t('auth.password_placeholder')}
                  error={errors.newPassword}
                />
              </div>
              <div>
                <label className="block mb-2">{t('auth.reset_password_confirm')}</label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                  placeholder={t('auth.password_placeholder')}
                  error={errors.confirmPassword}
                />
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              {errors.general && <p className="text-sm text-destructive w-full">{errors.general}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !newPassword || !confirmPassword}
              >
                {loading ? t('common.loading') : t('auth.reset_password_submit')}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
