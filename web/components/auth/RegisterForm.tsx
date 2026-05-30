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

export function RegisterForm() {
  const router = useRouter();
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

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.email) {
      newErrors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
          <h1 className="text-primary">SISTRA-TEC</h1>
          <p className="text-muted-foreground text-sm">Crea tu cuenta para empezar</p>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={formData.name}
                onChange={(e) => field('name', e.target.value)}
                placeholder="Juan Pérez"
                error={errors.name}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">Correo Electrónico</label>
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
            <label className="block mb-2 text-sm">Rol</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <select
                value={formData.role}
                onChange={(e) => field('role', e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-input border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option value="donante">Donante</option>
                <option value="transportista">Transportista</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm">Contraseña</label>
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
            <label className="block mb-2 text-sm">Confirmar Contraseña</label>
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
          <Button type="submit" className="w-full">Crear Cuenta</Button>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
