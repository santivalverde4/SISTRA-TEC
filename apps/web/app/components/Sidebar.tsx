import { Link, useLocation } from 'react-router-dom';
import {
  Home, Package, TrendingUp, Truck, MapPin,
  FileText, User, LogOut, HeartHandshake
} from 'lucide-react';
import { clsx } from 'clsx';

type UserRole = 'donante' | 'transportista' | 'administrador';

interface SidebarProps {
  userRole: UserRole;
  onLogout: () => void;
}

const menuItems = {
  donante: [
    { path: '/campanas', label: 'Campañas Disponibles', icon: HeartHandshake },
    { path: '/mis-donaciones', label: 'Mis Donaciones', icon: Package },
    { path: '/trazabilidad', label: 'Trazabilidad', icon: TrendingUp },
    { path: '/perfil', label: 'Perfil', icon: User },
  ],
  transportista: [
    { path: '/campanas-asignadas', label: 'Campañas Asignadas', icon: Truck },
    { path: '/trazabilidad-transporte', label: 'Trazabilidad de Transporte', icon: MapPin },
    { path: '/perfil', label: 'Perfil', icon: User },
  ],
  administrador: [
    { path: '/crear-campana', label: 'Crear Campaña', icon: HeartHandshake },
    { path: '/gestion-campanas', label: 'Gestión de Campañas', icon: Package },
    { path: '/transportistas', label: 'Transportistas', icon: Truck },
    { path: '/perfil', label: 'Perfil', icon: User },
  ],
};

export const Sidebar = ({ userRole, onLogout }: SidebarProps) => {
  const location = useLocation();
  const items = menuItems[userRole] || [];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-sidebar-foreground tracking-tight">
          SISTRA-TEC
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1 capitalize">
          {userRole}
        </p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
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
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};
