import { API_URL } from './config';
import { getToken } from './auth';
import type { Ciudad, Clima } from './types';

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

const post = (path: string, datos: unknown): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(datos),
});

export const login = (email: string, password: string) =>
  request<{ token: string }>('/api/auth/login', post('', { email, password }));

export const registro = (email: string, password: string) =>
  request<{ token: string }>('/api/auth/registro', post('', { email, password }));

export async function clima(lat: number, lng: number): Promise<Clima> {
  const r = await request<{ actual: Clima }>(`/api/clima?lat=${lat}&lng=${lng}`);
  return r.actual;
}

export async function geocodificar(q: string): Promise<Ciudad[]> {
  const r = await request<{ items: Ciudad[] }>(`/api/geocodificar?q=${encodeURIComponent(q)}`);
  return r.items;
}

export async function listarFavoritas(): Promise<Ciudad[]> {
  const r = await request<{ items: Ciudad[] }>('/api/ciudad_favorita');
  return r.items;
}

export const guardarFavorita = (c: Ciudad) => request<unknown>('/api/ciudad_favorita', post('', c));

export const borrarFavorita = (id: number) =>
  request<unknown>(`/api/ciudad_favorita/${id}`, { method: 'DELETE' });
