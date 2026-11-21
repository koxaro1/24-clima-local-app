import * as SQLite from 'expo-sqlite';
import type { Ciudad } from './types';

let abierta: Promise<SQLite.SQLiteDatabase> | null = null;

function db(): Promise<SQLite.SQLiteDatabase> {
  abierta ??= SQLite.openDatabaseAsync('clima.db').then(async (d) => {
    await d.execAsync(
      `CREATE TABLE IF NOT EXISTS ciudades (
        id INTEGER PRIMARY KEY,
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
    'SELECT id, nombre, region, pais, lat, lng FROM ciudades ORDER BY creada DESC',
  );
}

export async function agregarCiudad(c: Ciudad): Promise<void> {
  const d = await db();
  await d.runAsync(
    'INSERT OR REPLACE INTO ciudades (id, nombre, region, pais, lat, lng, creada) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [c.id, c.nombre, c.region ?? '', c.pais ?? '', c.lat, c.lng, new Date().toISOString()],
  );
}

export async function borrarCiudad(id: number): Promise<void> {
  const d = await db();
  await d.runAsync('DELETE FROM ciudades WHERE id = ?', [id]);
}
