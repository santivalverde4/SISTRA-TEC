'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui-custom/Card';
import { Input } from '@/components/ui-custom/Input';
import { Button } from '@/components/ui-custom/Button';
import { forgotPassword } from '@/services/authService';
import { useT } from '@/lib/i18n/useT';

export function ForgotPasswordForm() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(t('auth.error_email_invalid'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError(t('errors.generic'));
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
            <p className="text-muted-foreground">{t('auth.forgot_password_subtitle')}</p>
          </div>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              {t('auth.forgot_password_success')}
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder={t('auth.email_placeholder')}
                    error={error ?? undefined}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? t('common.loading') : t('auth.forgot_password_submit')}
              </Button>
            </CardFooter>
          </form>
        )}

        <CardFooter>
          <p className="text-sm text-muted-foreground w-full text-center">
            <Link href="/login" className="text-primary hover:underline">
              {t('auth.forgot_password_back_to_login')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
