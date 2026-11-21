export interface Ciudad {
  id: string;
  nombre: string;
  region: string;
  pais: string;
  lat: number;
  lng: number;
}

/** Resultado de /api/geocodificar (el id es numérico y no se guarda). */
export interface Geo {
  id: number;
  nombre: string;
  region?: string;
  pais?: string;
  lat: number;
  lng: number;
}

export interface FavoritaRemota {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  deleted_at: string | null;
}

export interface Clima {
  temperatura: number;
  viento: number;
  prob_lluvia: number;
  presion: number;
}

export const MAX_CIUDADES = 10;

export const CIUDAD_POR_DEFECTO: Ciudad = {
  id: 'por-defecto',
  nombre: 'Medellín',
  region: 'Antioquia',
  pais: 'Colombia',
  lat: 6.245,
  lng: -75.57151,
};
