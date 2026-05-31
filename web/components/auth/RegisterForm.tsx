'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { setRole, getDefaultRoute } from '@/lib/auth';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';

export function RegisterForm() {
  const router = useRouter();
  const { t } = useT();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donante' as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = t('auth.error_name_required');
    if (!formData.email) {
      newErrors.email = t('auth.error_email_required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.error_email_invalid');
    }
    if (!formData.password) {
      newErrors.password = t('auth.error_password_required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.error_password_min');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.error_passwords_mismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setRole(formData.role);
    router.push(getDefaultRoute(formData.role));
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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
            <label className="block mb-2 text-sm">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => field('password', e.target.value)}
                placeholder="••••••••"
                error={errors.password}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">{t('auth.confirm_password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => field('confirmPassword', e.target.value)}
                placeholder="••••••••"
                error={errors.confirmPassword}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button type="submit" className="w-full">{t('auth.register')}</Button>
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
