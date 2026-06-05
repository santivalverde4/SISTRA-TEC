import { api } from '@/lib/api';
import { createLogger } from '@/lib/logger';
import { setUser, getUser } from '@/lib/auth';

const log = createLogger('profileService');

interface BackendUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hasPassword: boolean;
}

interface BackendTransporter {
  vehicle: string;
  plate: string;
}

export interface ProfileData {
  name: string;
  email: string;
  hasPassword: boolean;
}

export interface VehicleData {
  vehicle: string;
  plate: string;
}

export async function getProfile(): Promise<ProfileData> {
  try {
    const data = await api.get<BackendUser>('/api/users/me');
    return { name: data.name ?? '', email: data.email, hasPassword: data.hasPassword };
  } catch (err) {
    log.error('getProfile failed', err);
    throw err;
  }
}

export async function updateProfile(payload: { name: string }): Promise<void> {
  try {
    await api.put('/api/users/me', { name: payload.name });
    const stored = getUser();
    if (stored) setUser({ ...stored, name: payload.name });
  } catch (err) {
    log.error('updateProfile failed', err);
    throw err;
  }
}

export async function changePassword(newPassword: string, currentPassword?: string): Promise<void> {
  try {
    const body: Record<string, string> = { newPassword };
    if (currentPassword) body.currentPassword = currentPassword;
    await api.post('/api/users/me/change-password', body);
  } catch (err) {
    log.error('changePassword failed', err);
    throw err;
  }
}

export async function getMyVehicle(): Promise<VehicleData> {
  try {
    const data = await api.get<BackendTransporter>('/api/transporters/me');
    return { vehicle: data.vehicle, plate: data.plate };
  } catch (err) {
    log.error('getMyVehicle failed', err);
    throw err;
  }
}

export async function updateMyVehicle(payload: VehicleData): Promise<void> {
  try {
    await api.put('/api/transporters/me', payload);
  } catch (err) {
    log.error('updateMyVehicle failed', err);
    throw err;
  }
}
