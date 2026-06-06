import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import { mapRole, mapRoleToBackend, setToken, setUser, type BackendRole } from '@/lib/auth';
import type { UserRole } from '@/types';

const log = createLogger('authService');

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface LoginResult {
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  vehicle?: string;
  plate?: string;
}

interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; name: string | null; role: BackendRole };
}

function storeSession(data: AuthResponse): AuthUser {
  const role = mapRole(data.user.role);
  setToken(data.accessToken);
  setUser({ id: data.user.id, email: data.user.email, name: data.user.name, role });
  return { id: data.user.id, email: data.user.email, name: data.user.name, role };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const data = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return storeSession(data);
  } catch (err) {
    log.error('login failed', err);
    throw err;
  }
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  try {
    const data = await api.post<AuthResponse>('/api/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: mapRoleToBackend(payload.role),
      vehicle: payload.vehicle,
      plate: payload.plate,
    });
    return storeSession(data);
  } catch (err) {
    log.error('register failed', err);
    throw err;
  }
}

export async function completeGoogleAuth(tempToken: string, role?: UserRole, vehicle?: string, plate?: string): Promise<AuthUser> {
  try {
    const body: Record<string, string> = { tempToken };
    if (role) body.role = mapRoleToBackend(role);
    if (vehicle) body.vehicle = vehicle;
    if (plate) body.plate = plate;
    const data = await api.post<AuthResponse>('/api/auth/google/complete', body);
    return storeSession(data);
  } catch (err) {
    log.error('google complete failed', err);
    throw err;
  }
}
