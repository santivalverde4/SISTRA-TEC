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
import { useT } from '@/lib/i18n/useT';

interface SidebarProps {
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ userRole, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();

  const menuItems: Record<UserRole, { path: string; label: string; icon: React.ElementType }[]> = {
    donante: [
      { path: '/dashboard/donante/campaigns', label: t('sidebar.available_campaigns'), icon: HeartHandshake },
      { path: '/dashboard/donante/donations', label: t('sidebar.my_donations'), icon: Package },
      { path: '/dashboard/donante/traceability', label: t('sidebar.donation_traceability'), icon: TrendingUp },
      { path: '/dashboard/profile', label: t('sidebar.profile'), icon: User },
    ],
    transportista: [
      { path: '/dashboard/transportista/campaigns', label: t('sidebar.assigned_campaigns'), icon: Truck },
      { path: '/dashboard/transportista/traceability', label: t('sidebar.transport_traceability'), icon: MapPin },
      { path: '/dashboard/profile', label: t('sidebar.profile'), icon: User },
    ],
    administrador: [
      { path: '/dashboard/admin/campaigns', label: t('sidebar.manage_campaigns'), icon: Package },
      { path: '/dashboard/admin/campaigns/create', label: t('sidebar.create_campaign'), icon: HeartHandshake },
      { path: '/dashboard/admin/transporters', label: t('sidebar.transporters'), icon: Truck },
      { path: '/dashboard/profile', label: t('sidebar.profile'), icon: User },
    ],
  };

  const items = menuItems[userRole] ?? [];

  function handleLogout() {
    clearSession();
    router.push('/login');
  }

  function handleNavClick() {
    onClose();
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-transform duration-300',
          'md:sticky md:top-0 md:translate-x-0 md:w-64',
          'fixed top-0 left-0 z-40 w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
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
                    onClick={handleNavClick}
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
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
