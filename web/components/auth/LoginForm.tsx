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

const MOCK_USERS: { email: string; password: string; role: UserRole }[] = [
  { email: 'donante@test.com', password: '123456', role: 'donante' },
  { email: 'transportista@test.com', password: '123456', role: 'transportista' },
  { email: 'admin@test.com', password: '123456', role: 'administrador' },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El correo no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      setErrors({ general: 'Credenciales incorrectas. Usa los usuarios de prueba.' });
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
            <h1 className="text-primary">SISTRA-TEC</h1>
            <p className="text-muted-foreground">Sistema de Trazabilidad de Campañas Humanitarias</p>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  error={errors.email}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Contraseña</label>
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
              <p className="font-medium">Usuarios de prueba (contraseña: 123456):</p>
              <p>donante@test.com · transportista@test.com · admin@test.com</p>
            </div>
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
