import axios from 'axios';
import type { GenericApiResponse, TokenizedUser } from '@/types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.villaekinoks.com/api/v1';

const KEYS = {
  accessToken: 'accesstoken',
  refreshToken: 'refreshtoken',
  accessTokenExpiration: 'accesstokenexpiration',
  refreshTokenExpiration: 'refreshtokenexpiration',
  user: 'user',
} as const;

// Plain client without the auth interceptors, so the mirror call can't recurse into them
const sessionClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const isBrowser = () => typeof window !== 'undefined';

// Normalizes backend values to epoch milliseconds (accepts seconds as well)
const toEpochMs = (value: number): number => (value < 1e12 ? value * 1000 : value);

// Fallback for when the backend doesn't send the expiration: read the JWT `exp` claim
const getJwtExpiration = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const exp = JSON.parse(atob(payload)).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const readExpiration = (key: string, token: string | null): number | null => {
  const stored = Number(localStorage.getItem(key));
  if (stored > 0) return toEpochMs(stored);
  return getJwtExpiration(token);
};

export const isAccessTokenExpired = (): boolean => {
  if (!isBrowser()) return false;
  const expiration = readExpiration(KEYS.accessTokenExpiration, localStorage.getItem(KEYS.accessToken));
  return expiration === null || expiration <= Date.now();
};

export const isRefreshTokenExpired = (): boolean => {
  if (!isBrowser()) return false;
  const expiration = readExpiration(KEYS.refreshTokenExpiration, localStorage.getItem(KEYS.refreshToken));
  return expiration === null || expiration <= Date.now();
};

export const storeSession = (tokenizedUser: TokenizedUser): void => {
  if (!isBrowser()) return;
  const { accesstoken, refreshtoken, accesstokenexpiration, refreshtokenexpiration, user } = tokenizedUser;

  localStorage.setItem(KEYS.accessToken, accesstoken);
  localStorage.setItem(KEYS.refreshToken, refreshtoken);
  localStorage.setItem(KEYS.user, JSON.stringify(user));

  const accessExpiration = accesstokenexpiration ? toEpochMs(accesstokenexpiration) : getJwtExpiration(accesstoken);
  const refreshExpiration = refreshtokenexpiration ? toEpochMs(refreshtokenexpiration) : getJwtExpiration(refreshtoken);
  if (accessExpiration) localStorage.setItem(KEYS.accessTokenExpiration, String(accessExpiration));
  else localStorage.removeItem(KEYS.accessTokenExpiration);
  if (refreshExpiration) localStorage.setItem(KEYS.refreshTokenExpiration, String(refreshExpiration));
  else localStorage.removeItem(KEYS.refreshTokenExpiration);
};

export const clearSession = (): void => {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
};

// Clears the stored session and sends the user back to the login page
export const forceLogout = (): void => {
  if (!isBrowser()) return;
  clearSession();
  if (globalThis.location.pathname !== '/login') {
    globalThis.location.href = '/login';
  }
};

let refreshInFlight: Promise<boolean> | null = null;

// Calls the MirrorController with the refresh token and replaces the stored session on success
const refreshSession = (): Promise<boolean> => {
  refreshInFlight ??= (async () => {
    const refreshToken = localStorage.getItem(KEYS.refreshToken);
    if (!refreshToken || isRefreshTokenExpired()) return false;
    try {
      const response = await sessionClient.get<GenericApiResponse<TokenizedUser>>('/mirror', {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      storeSession(response.data.object);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
};

/**
 * Makes sure the user still has a valid session.
 * - Access token not expired: nothing to do, the mirror call is skipped.
 * - Access token expired: renew everything through the mirror endpoint using the refresh token;
 *   if that fails (or the refresh token expired too) the user is logged out.
 * Concurrent calls share a single mirror request.
 */
export const ensureValidSession = async (): Promise<boolean> => {
  if (!isBrowser() || !localStorage.getItem(KEYS.accessToken)) return false;
  if (!isAccessTokenExpired()) return true;

  const refreshed = await refreshSession();
  if (!refreshed) forceLogout();
  return refreshed;
};
