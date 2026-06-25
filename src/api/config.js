/**
 * API base URL for all backend requests.
 *
 * Local dev default: https://sam.jitihada.co.tz
 *
 * Production hosting notes:
 * - If your site is HTTPS (Netlify, Vercel, etc.) and the API is HTTP only,
 *   browsers block requests (axios shows "Network Error"). Fix options:
 *   1) Enable HTTPS on the API server (recommended), or
 *   2) Proxy API through your host on the same HTTPS domain, then set:
 *      REACT_APP_API_BASE=https://your-domain.com
 *   3) Host the React build on the same HTTP server as the PHP API and set:
 *      REACT_APP_API_BASE=
 *      (empty = same-origin paths like /submit.php)
 */
const DEFAULT_API_BASE = 'https://sam.jitihada.co.tz';

function resolveApiBase() {
  if (process.env.REACT_APP_API_BASE !== undefined) {
    return process.env.REACT_APP_API_BASE.replace(/\/$/, '');
  }

  return DEFAULT_API_BASE;
}

export const API_BASE = resolveApiBase();

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}

export function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') {
    return '';
  }

  const trimmed = path.trim();

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  return apiUrl(trimmed.startsWith('/') ? trimmed : `/${trimmed}`);
}

export function isLikelyNetworkBlockedError(error) {
  return (
    error?.message === 'Network Error' ||
    error?.code === 'ERR_NETWORK' ||
    (!error?.response && Boolean(error?.request))
  );
}

export function formatNetworkError(error, fallback) {
  if (isLikelyNetworkBlockedError(error)) {
    return (
      'Unable to reach the server. If this site uses HTTPS, the API must also use HTTPS ' +
      'or be proxied on the same domain. Contact your administrator or set REACT_APP_API_BASE.'
    );
  }

  return error.response?.data?.message || error.message || fallback;
}
