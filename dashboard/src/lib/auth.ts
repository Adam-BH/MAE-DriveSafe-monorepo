import { api } from './api';

export interface AuthUser {
  token: string;
  driver: unknown | null;
  role: 'insurer' | 'driver';
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<{ token: string; driver: unknown | null }>('/auth/login', {
    email,
    password,
  });
  const payload = parseJwt(data.token);
  localStorage.setItem('dg_token', data.token);
  return { token: data.token, driver: data.driver, role: payload.role };
}

export function logout(): void {
  localStorage.removeItem('dg_token');
  window.location.href = '/login';
}

export function getToken(): string | null {
  return localStorage.getItem('dg_token');
}

export function getCurrentUser(): { sub: string; role: 'insurer' | 'driver'; driverId?: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    return parseJwt(token);
  } catch {
    return null;
  }
}

function parseJwt(token: string): any {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}
