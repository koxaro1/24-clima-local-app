import { API_URL } from './config';
import { clearSesion, getRefresh, getToken, saveSesion } from './auth';
import type { Ciudad, Clima, FavoritaRemota, Geo } from './types';

export class SesionExpirada extends Error {
  constructor() {
    super('Sesión expirada');
    this.name = 'SesionExpirada';
  }
}

interface Sesion {
  token?: string;
  idToken?: string;
  refreshToken?: string;
}

async function renovar(): Promise<boolean> {
  const refresh = await getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return false;
    const s = (await res.json()) as Sesion;
    const token = s.token ?? s.idToken;
    if (!token) return false;
    await saveSesion(token, s.refreshToken ?? refresh);
    return true;
  } catch {
    return false;
  }
}

async function llamar(path: string, init: RequestInit): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

async function request<T>(path: string, init: RequestInit = {}, reintento = true): Promise<T> {
  const res = await llamar(path, init);
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    if (reintento && (await renovar())) return request<T>(path, init, false);
    await clearSesion();
    throw new SesionExpirada();
  }
  const cuerpo: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (cuerpo as { error?: string }).error;
    throw new Error(msg ?? `Error ${res.status}`);
  }
  return cuerpo as T;
}

const enviar = (metodo: string, datos: unknown): RequestInit => ({
  method: metodo,
  body: JSON.stringify(datos),
});

interface Credenciales {
  token: string;
  refreshToken: string;
}

export const login = (email: string, password: string) =>
  request<Credenciales>('/api/auth/login', enviar('POST', { email, password }));

export const registro = (email: string, password: string) =>
  request<Credenciales>('/api/auth/registro', enviar('POST', { email, password }));

export async function clima(lat: number, lng: number): Promise<Clima> {
  const r = await request<{ actual: Clima }>(`/api/clima?lat=${lat}&lng=${lng}`);
  return r.actual;
}

export async function geocodificar(q: string): Promise<Geo[]> {
  const r = await request<{ items: Geo[] }>(`/api/geocodificar?q=${encodeURIComponent(q)}`);
  return r.items;
}

export async function listarFavoritas(): Promise<FavoritaRemota[]> {
  const r = await request<{ items: FavoritaRemota[] }>('/api/ciudad_favorita');
  return r.items;
}

export const guardarFavorita = (c: Ciudad) =>
  request<unknown>(
    `/api/ciudad_favorita/${c.id}`,
    enviar('PUT', { nombre: c.nombre, lat: c.lat, lng: c.lng }),
  );

export const borrarFavorita = (id: string) =>
  request<unknown>(`/api/ciudad_favorita/${id}`, { method: 'DELETE' });
