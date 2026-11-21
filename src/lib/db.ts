import * as SQLite from 'expo-sqlite';
import type { Ciudad } from './types';

let abierta: Promise<SQLite.SQLiteDatabase> | null = null;

function db(): Promise<SQLite.SQLiteDatabase> {
  abierta ??= SQLite.openDatabaseAsync('clima.db').then(async (d) => {
    await d.execAsync(
      `CREATE TABLE IF NOT EXISTS favoritas (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        region TEXT NOT NULL DEFAULT '',
        pais TEXT NOT NULL DEFAULT '',
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        creada TEXT NOT NULL
      )`,
    );
    return d;
  });
  return abierta;
}

export async function listarCiudades(): Promise<Ciudad[]> {
  const d = await db();
  return d.getAllAsync<Ciudad>(
    'SELECT id, nombre, region, pais, lat, lng FROM favoritas ORDER BY creada DESC',
  );
}

/** Inserta o actualiza nombre y coordenadas; conserva región y país locales. */
export async function agregarCiudad(c: Ciudad): Promise<void> {
  const d = await db();
  await d.runAsync(
    `INSERT INTO favoritas (id, nombre, region, pais, lat, lng, creada)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nombre = excluded.nombre, lat = excluded.lat, lng = excluded.lng`,
    [c.id, c.nombre, c.region, c.pais, c.lat, c.lng, new Date().toISOString()],
  );
}

export async function borrarCiudad(id: string): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM favoritas WHERE id = ?', [id]);
}
