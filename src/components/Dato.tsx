import { StyleSheet, Text, View } from 'react-native';
import { colores } from '../lib/theme';

export function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.linea,
  },
  etiqueta: { color: colores.suave, fontSize: 16 },
  valor: { color: colores.tinta, fontSize: 16, fontWeight: '700' },
});
