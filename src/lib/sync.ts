import { guardarFavorita, listarFavoritas } from './api';
import { agregarCiudad, borrarCiudad, listarCiudades } from './db';

/**
 * Trae las favoritas del servidor (las borradas se quitan) y sube las que
 * solo existen en este teléfono. Sin red o sin sesión, no hace nada.
 */
export async function sincronizar(): Promise<void> {
  try {
    const remotas = await listarFavoritas();
    const conocidas = new Set(remotas.map((r) => r.id));
    for (const r of remotas) {
      if (r.deleted_at) {
        await borrarCiudad(r.id);
      } else {
        await agregarCiudad({
          id: r.id,
          nombre: r.nombre,
          region: '',
          pais: '',
          lat: r.lat,
          lng: r.lng,
        });
      }
    }
    for (const c of await listarCiudades()) {
      if (!conocidas.has(c.id)) await guardarFavorita(c);
    }
  } catch {
    // Sin conexión o sin sesión: la app sigue con los datos locales.
  }
}
