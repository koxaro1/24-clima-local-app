import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { clima, SesionExpirada } from '../../lib/api';
import { getToken } from '../../lib/auth';
import { listarCiudades } from '../../lib/db';
import { sincronizar } from '../../lib/sync';
import { colores } from '../../lib/theme';
import { CIUDAD_POR_DEFECTO, type Ciudad, type Clima } from '../../lib/types';
import { Dato } from '../../components/Dato';

export default function Inicio() {
  const router = useRouter();
  const [ciudad, setCiudad] = useState<Ciudad>(CIUDAD_POR_DEFECTO);
  const [datos, setDatos] = useState<Clima | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      if (!(await getToken())) {
        router.replace('/login');
        return;
      }
      await sincronizar();
      const [primera] = await listarCiudades();
      const c = primera ?? CIUDAD_POR_DEFECTO;
      setCiudad(c);
      setDatos(await clima(c.lat, c.lng));
    } catch (e) {
      if (e instanceof SesionExpirada) {
        router.replace('/login');
        return;
      }
      setError(e instanceof Error ? e.message : 'No se pudo cargar el clima.');
    } finally {
      setCargando(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      refreshControl={<RefreshControl refreshing={cargando} onRefresh={() => void cargar()} />}
    >
      <Text style={estilos.ciudad}>{ciudad.nombre}</Text>
      <Text style={estilos.region}>{[ciudad.region, ciudad.pais].filter(Boolean).join(', ')}</Text>
      {error ? (
        <Text style={estilos.error}>{error} Desliza hacia abajo para reintentar.</Text>
      ) : null}
      {datos ? (
        <>
          <Text style={estilos.temp}>{datos.temperatura.toFixed(1)}°</Text>
          <Dato etiqueta="Viento" valor={`${datos.viento} m/s`} />
          <Dato etiqueta="Probabilidad de lluvia" valor={`${datos.prob_lluvia} %`} />
          <Dato etiqueta="Presión" valor={`${datos.presion} hPa`} />
        </>
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20 },
  ciudad: { fontSize: 30, fontWeight: '800', color: colores.tinta },
  region: { fontSize: 16, color: colores.suave, marginBottom: 12 },
  temp: { fontSize: 88, fontWeight: '200', color: colores.tinta, marginVertical: 12 },
  error: { color: colores.peligro, marginVertical: 8 },
});
