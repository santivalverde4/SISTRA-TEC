import type { UserRole } from '@/types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export type BackendRole = 'DONOR' | 'TRANSPORTER' | 'ADMIN_CENTER';

export interface StoredUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export function mapRole(backendRole: BackendRole): UserRole {
  switch (backendRole) {
    case 'DONOR': return 'donante';
    case 'TRANSPORTER': return 'transportista';
    case 'ADMIN_CENTER': return 'administrador';
  }
}

export function mapRoleToBackend(role: UserRole): BackendRole {
  switch (role) {
    case 'donante': return 'DONOR';
    case 'transportista': return 'TRANSPORTER';
    case 'administrador': return 'ADMIN_CENTER';
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getRole(): UserRole | null {
  return getUser()?.role ?? null;
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token || !getUser()) return false;
  return !isTokenExpired(token);
}

export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'donante': return '/dashboard/donante/campaigns';
    case 'transportista': return '/dashboard/transportista/campaigns';
    case 'administrador': return '/dashboard/admin/campaigns';
  }
}
