import { API_URL } from './config';
import { getToken } from './auth';
import type { Ciudad, Clima, FavoritaRemota, Geo } from './types';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
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

export const login = (email: string, password: string) =>
  request<{ token: string }>('/api/auth/login', enviar('POST', { email, password }));

export const registro = (email: string, password: string) =>
  request<{ token: string }>('/api/auth/registro', enviar('POST', { email, password }));

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
