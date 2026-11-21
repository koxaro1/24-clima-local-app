import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { geocodificar, guardarFavorita } from '../lib/api';
import { agregarCiudad, listarCiudades } from '../lib/db';
import { uuidv4 } from '../lib/uuid';
import { colores } from '../lib/theme';
import { type Ciudad, type Geo, MAX_CIUDADES } from '../lib/types';
import { Boton } from '../components/Boton';

export default function Buscar() {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [items, setItems] = useState<Geo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function buscar() {
    const q = texto.trim();
    if (q.length < 2) {
      setError('Escribe al menos 2 letras.');
      return;
    }
    setError(null);
    setOcupado(true);
    try {
      setItems(await geocodificar(q));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo buscar.');
    } finally {
      setOcupado(false);
    }
  }

  async function elegir(g: Geo) {
    const existentes = await listarCiudades();
    if (existentes.length >= MAX_CIUDADES) {
      setError(`Máximo ${MAX_CIUDADES} ciudades. Borra una para agregar otra.`);
      return;
    }
    const repetida = existentes.some((e) => e.lat === g.lat && e.lng === g.lng);
    if (!repetida) {
      const c: Ciudad = {
        id: uuidv4(),
        nombre: g.nombre,
        region: g.region ?? '',
        pais: g.pais ?? '',
        lat: g.lat,
        lng: g.lng,
      };
      await agregarCiudad(c);
      try {
        await guardarFavorita(c);
      } catch {
        // Queda en el teléfono y se sube en la próxima sincronización.
      }
    }
    router.back();
  }
  return (
    <View style={estilos.pantalla}>
      <TextInput
        style={estilos.campo}
        placeholder="Nombre de la ciudad"
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={() => void buscar()}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Buscar" onPress={() => void buscar()} deshabilitado={ocupado} />
      <FlatList
        style={estilos.lista}
        data={items}
        keyExtractor={(c) => String(c.id)}
        renderItem={({ item }) => (
          <Pressable style={estilos.item} onPress={() => void elegir(item)}>
            <Text style={estilos.nombre}>{item.nombre}</Text>
            <Text style={estilos.detalle}>
              {[item.region, item.pais].filter(Boolean).join(', ')}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, backgroundColor: colores.fondo },
  campo: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  error: { color: colores.peligro, marginTop: 8 },
  lista: { marginTop: 16 },
  item: { backgroundColor: colores.blanco, padding: 16, borderRadius: 10, marginBottom: 10 },
  nombre: { fontSize: 18, fontWeight: '700', color: colores.tinta },
  detalle: { color: colores.suave, marginTop: 2 },
});
