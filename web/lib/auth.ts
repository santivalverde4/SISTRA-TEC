import type { UserRole } from '@/types';

const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'userRole';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getRole(): UserRole | null {
  return localStorage.getItem(ROLE_KEY) as UserRole | null;
}

export function setRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getRole();
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'donante':
      return '/dashboard/donante/campaigns';
    case 'transportista':
      return '/dashboard/transportista/campaigns';
    case 'administrador':
      return '/dashboard/admin/campaigns';
  }
}
