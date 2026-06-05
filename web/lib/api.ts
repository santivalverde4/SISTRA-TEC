import { getToken, clearSession } from './auth';
import { logger } from './logger';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Prevents multiple concurrent 401s from triggering multiple redirects
let redirecting = false;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const token = getToken();

  logger.debug(`${method} ${path}`, undefined, 'api');

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (networkErr) {
    logger.error(`${method} ${path} — network error`, networkErr, 'api');
    throw networkErr;
  }

  logger.debug(`${method} ${path} → ${response.status}`, undefined, 'api');

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    logger.warn(`${method} ${path} → 401 session expired`, undefined, 'api');
    if (!redirecting) {
      redirecting = true;
      clearSession();
      window.location.href = '/login';
    }
    throw new Error('session_expired');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.message ?? body?.error ?? response.statusText;
    logger.error(`${method} ${path} → ${response.status}`, { message, body }, 'api');
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
