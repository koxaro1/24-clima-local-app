export interface Ciudad {
  id: number;
  nombre: string;
  region: string;
  pais: string;
  lat: number;
  lng: number;
}

export interface Clima {
  temperatura: number;
  viento: number;
  prob_lluvia: number;
  presion: number;
}

export const CIUDAD_POR_DEFECTO: Ciudad = {
  id: 3674962,
  nombre: 'Medellín',
  region: 'Antioquia',
  pais: 'Colombia',
  lat: 6.245,
  lng: -75.57151,
};
