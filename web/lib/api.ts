import { getToken, setToken, clearSession } from './auth';
import { logger } from './logger';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Prevents multiple concurrent refresh attempts
let refreshPromise: Promise<string | null> | null = null;
// Prevents multiple concurrent redirects to login
let redirecting = false;

async function attemptTokenRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      const newToken: string = data.accessToken;
      setToken(newToken);
      return newToken;
    })
    .catch(() => null)
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const token = getToken();

  logger.debug(`${method} ${path}`, undefined, 'api');

  const buildHeaders = (t: string | null) => ({
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  });

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(token),
    });
  } catch (networkErr) {
    logger.error(`${method} ${path} — network error`, networkErr, 'api');
    throw networkErr;
  }

  logger.debug(`${method} ${path} → ${response.status}`, undefined, 'api');

  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    logger.warn(`${method} ${path} → 401, attempting token refresh`, undefined, 'api');

    const newToken = await attemptTokenRefresh();

    if (newToken) {
      const retried = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: buildHeaders(newToken),
      });

      if (retried.ok) {
        return retried.json() as Promise<T>;
      }

      if (retried.status === 401) {
        // Refresh succeeded but request still 401 — genuine auth failure
        if (!redirecting) {
          redirecting = true;
          clearSession();
          window.location.href = '/login';
        }
        throw new Error('session_expired');
      }

      const retryBody = await retried.json().catch(() => null);
      const retryMessage = retryBody?.message ?? retryBody?.error ?? retried.statusText;
      throw new Error(retryMessage);
    }

    // Refresh failed — session is truly expired
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
