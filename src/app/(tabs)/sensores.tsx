import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { clima } from '../../lib/api';
import { colores } from '../../lib/theme';
import { CIUDAD_POR_DEFECTO } from '../../lib/types';
import { Boton } from '../../components/Boton';
import { Dato } from '../../components/Dato';

const UMBRAL_SACUDIDA = 2.2;

export default function Sensores() {
  const [disponible, setDisponible] = useState<boolean | null>(null);
  const [lectura, setLectura] = useState<AccelerometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: 0,
  });
  const [sacudidas, setSacudidas] = useState(0);
  const [temp, setTemp] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  const actualizar = useCallback(async () => {
    try {
      const d = await clima(CIUDAD_POR_DEFECTO.lat, CIUDAD_POR_DEFECTO.lng);
      setTemp(`${d.temperatura.toFixed(1)}°`);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar.');
    }
  }, []);

  useEffect(() => {
    let activa = true;
    let sub: { remove: () => void } | undefined;
    void Accelerometer.isAvailableAsync().then((ok) => {
      if (!activa) return;
      setDisponible(ok);
      if (!ok) return;
      Accelerometer.setUpdateInterval(300);
      sub = Accelerometer.addListener((m) => {
        setLectura(m);
        const fuerza = Math.sqrt(m.x * m.x + m.y * m.y + m.z * m.z);
        if (fuerza > UMBRAL_SACUDIDA) {
          setSacudidas((n) => n + 1);
          void actualizar();
        }
      });
    });
    return () => {
      activa = false;
      sub?.remove();
    };
  }, [actualizar]);

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Agita el teléfono para actualizar el clima</Text>
      {disponible === false ? (
        <Text style={estilos.aviso}>Este dispositivo no tiene acelerómetro. Usa el botón.</Text>
      ) : (
        <>
          <Dato etiqueta="x" valor={lectura.x.toFixed(2)} />
          <Dato etiqueta="y" valor={lectura.y.toFixed(2)} />
          <Dato etiqueta="z" valor={lectura.z.toFixed(2)} />
          <Dato etiqueta="Sacudidas detectadas" valor={String(sacudidas)} />
        </>
      )}
      <Dato etiqueta={`Temperatura en ${CIUDAD_POR_DEFECTO.nombre}`} valor={temp} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Actualizar sin agitar" secundario onPress={() => void actualizar()} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, backgroundColor: colores.fondo },
  titulo: { fontSize: 20, fontWeight: '700', color: colores.tinta, marginBottom: 12 },
  aviso: { color: colores.peligro, marginBottom: 12 },
  error: { color: colores.peligro, marginTop: 8 },
});
