import { Pressable, StyleSheet, Text } from 'react-native';
import { colores } from '../lib/theme';

interface Props {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
  deshabilitado?: boolean;
}

export function Boton({ titulo, onPress, secundario, deshabilitado }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={deshabilitado}
      onPress={onPress}
      style={[
        estilos.base,
        secundario ? estilos.secundario : estilos.primario,
        deshabilitado ? estilos.apagado : null,
      ]}
    >
      <Text style={[estilos.texto, secundario ? estilos.textoSec : null]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primario: { backgroundColor: colores.acento },
  secundario: { borderWidth: 1, borderColor: colores.acento },
  apagado: { opacity: 0.5 },
  texto: { color: colores.blanco, fontWeight: '700', fontSize: 16 },
  textoSec: { color: colores.acento },
});
