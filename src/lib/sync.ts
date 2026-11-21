import { listarFavoritas } from './api';
import { agregarCiudad } from './db';

const esCiudad = (x: unknown): boolean => {
  const c = x as Record<string, unknown>;
  return (
    typeof c.id === 'number' &&
    typeof c.nombre === 'string' &&
    typeof c.lat === 'number' &&
    typeof c.lng === 'number'
  );
};

/** Trae las favoritas del servidor y las guarda en SQLite. Sin red, no hace nada. */
export async function sincronizar(): Promise<void> {
  try {
    const remotas = await listarFavoritas();
    for (const c of remotas.filter(esCiudad)) await agregarCiudad(c);
  } catch {
    // Sin conexión o sin sesión: la app sigue con los datos locales.
  }
}
