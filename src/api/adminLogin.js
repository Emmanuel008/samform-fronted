import axios from 'axios';
import { apiUrl, formatNetworkError } from './config';

export const ADMIN_LOGIN_URL = apiUrl('/admin_login.php');
export const ADMIN_SESSION_KEY = 'maramboAdminSession';

export function buildAdminLoginPayload(username, password) {
  const payload = new FormData();
  payload.append('username', username);
  payload.append('password', password);
  return payload;
}

export function saveAdminSession(data) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(data));
}

export function getAdminSession() {
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getAdminKey() {
  const session = getAdminSession();
  return (
    session?.adminKey ||
    session?.admin_key ||
    session?.apiKey ||
    session?.api_key ||
    session?.token ||
    session?.key ||
    ''
  );
}

export async function adminLogin(username, password) {
  try {
    const payload = buildAdminLoginPayload(username, password);
    const response = await axios.post(ADMIN_LOGIN_URL, payload);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed.');
    }

    return response.data;
  } catch (error) {
    throw new Error(formatNetworkError(error, 'Unable to sign in. Please try again.'));
  }
}
