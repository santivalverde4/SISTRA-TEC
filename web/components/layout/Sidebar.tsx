'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HeartHandshake, Package, TrendingUp, Truck,
  MapPin, User, LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { UserRole } from '@/types';
import { clearSession } from '@/lib/auth';

interface SidebarProps {
  userRole: UserRole;
}

const menuItems: Record<UserRole, { path: string; label: string; icon: React.ElementType }[]> = {
  donante: [
    { path: '/dashboard/donante/campaigns', label: 'Campañas Disponibles', icon: HeartHandshake },
    { path: '/dashboard/donante/donations', label: 'Mis Donaciones', icon: Package },
    { path: '/dashboard/donante/traceability', label: 'Trazabilidad', icon: TrendingUp },
    { path: '/dashboard/profile', label: 'Perfil', icon: User },
  ],
  transportista: [
    { path: '/dashboard/transportista/campaigns', label: 'Campañas Asignadas', icon: Truck },
    { path: '/dashboard/transportista/traceability', label: 'Trazabilidad de Transporte', icon: MapPin },
    { path: '/dashboard/profile', label: 'Perfil', icon: User },
  ],
  administrador: [
    { path: '/dashboard/admin/campaigns', label: 'Gestión de Campañas', icon: Package },
    { path: '/dashboard/admin/campaigns/create', label: 'Crear Campaña', icon: HeartHandshake },
    { path: '/dashboard/admin/transporters', label: 'Transportistas', icon: Truck },
    { path: '/dashboard/profile', label: 'Perfil', icon: User },
  ],
};

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = menuItems[userRole] ?? [];

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-sidebar-foreground tracking-tight">SISTRA-TEC</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1 capitalize">{userRole}</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
