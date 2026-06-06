'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui-custom/Input';
import { PasswordInput } from '@/components/ui-custom/PasswordInput';
import { Button } from '@/components/ui-custom/Button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { getDefaultRoute, isAuthenticated, getRole } from '@/lib/auth';
import { login } from '@/services/authService';
import { resolveErrorKey } from '@/lib/apiError';
import { useT } from '@/lib/i18n/useT';

export function LoginForm() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getRole();
      if (role) router.replace(getDefaultRoute(role));
    }
  }, [router]);
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(getDefaultRoute(user.role));
    } catch (err) {
      setErrors({ general: t(resolveErrorKey(err, 'auth') as Parameters<typeof t>[0]) });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    window.location.href = `${apiUrl}/api/auth/google`;
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
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.password}
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-3">
            {errors.general && (
              <p className="text-sm text-destructive w-full">{errors.general}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </Button>
            <div className="relative w-full flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t('auth.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {t('auth.login_with_google')}
            </Button>
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
