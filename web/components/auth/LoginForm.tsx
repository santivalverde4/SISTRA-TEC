'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { setRole, getDefaultRoute } from '@/lib/auth';
import type { UserRole } from '@/types';
import { useT } from '@/lib/i18n/useT';

const MOCK_USERS: { email: string; password: string; role: UserRole }[] = [
  { email: 'donante@test.com', password: '123456', role: 'donante' },
  { email: 'transportista@test.com', password: '123456', role: 'transportista' },
  { email: 'admin@test.com', password: '123456', role: 'administrador' },
];

export function LoginForm() {
  const router = useRouter();
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t('auth.error_email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.error_email_invalid');
    }

    if (!password) {
      newErrors.password = t('auth.error_password_required');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      setErrors({ general: t('auth.error_invalid_credentials') });
      return;
    }

    setRole(user.role);
    router.push(getDefaultRoute(user.role));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-primary">{t('auth.app_title')}</h1>
            <p className="text-muted-foreground">{t('auth.app_subtitle')}</p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email_placeholder')}
                  error={errors.email}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  error={errors.password}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            {errors.general && (
              <p className="text-sm text-destructive w-full">{errors.general}</p>
            )}
            <div className="text-xs text-muted-foreground w-full space-y-1">
              <p className="font-medium">{t('auth.test_users')}</p>
              <p>{t('auth.test_users_list')}</p>
            </div>
            <Button type="submit" className="w-full">{t('auth.login')}</Button>
            <p className="text-sm text-muted-foreground">
              {t('auth.no_account')}{' '}
              <Link href="/register" className="text-primary hover:underline">
                {t('auth.register_link')}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
