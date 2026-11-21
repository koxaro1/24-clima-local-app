import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { borrarFavorita } from '../../lib/api';
import { borrarCiudad, listarCiudades } from '../../lib/db';
import { sincronizar } from '../../lib/sync';
import { colores } from '../../lib/theme';
import type { Ciudad } from '../../lib/types';
import { Boton } from '../../components/Boton';
import { SwipeRow } from '../../components/SwipeRow';

export default function Ciudades() {
  const router = useRouter();
  const [lista, setLista] = useState<Ciudad[]>([]);

  const cargar = useCallback(async () => {
    await sincronizar();
    setLista(await listarCiudades());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  async function quitar(id: string) {
    await borrarCiudad(id);
    setLista(await listarCiudades());
    try {
      await borrarFavorita(id);
    } catch {
      // Sin red: queda borrada solo en este dispositivo.
    }
  }

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={lista}
        keyExtractor={(c) => String(c.id)}
        ListEmptyComponent={
          <Text style={estilos.vacio}>Aún no guardas ciudades. Pulsa «Agregar ciudad».</Text>
        }
        renderItem={({ item }) => (
          <SwipeRow onDelete={() => void quitar(item.id)}>
            <Text style={estilos.nombre}>{item.nombre}</Text>
            <Text style={estilos.detalle}>
              {[item.region, item.pais].filter(Boolean).join(', ')}
            </Text>
          </SwipeRow>
        )}
      />
      <Text style={estilos.ayuda}>Desliza una ciudad a la izquierda para borrarla.</Text>
      <Boton titulo="Agregar ciudad" onPress={() => router.push('/buscar')} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, backgroundColor: colores.fondo },
  nombre: { fontSize: 18, fontWeight: '700', color: colores.tinta },
  detalle: { color: colores.suave, marginTop: 2 },
  vacio: { color: colores.suave, marginTop: 20 },
  ayuda: { color: colores.suave, fontSize: 13, marginTop: 8 },
});
