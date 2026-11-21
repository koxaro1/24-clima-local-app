import { type ReactNode, useMemo, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { colores } from '../lib/theme';

interface Props {
  children: ReactNode;
  onDelete: () => void;
}

/** Gesto: arrastrar la fila hacia la izquierda para borrarla. */
export function SwipeRow({ children, onDelete }: Props) {
  const [x] = useState(() => new Animated.Value(0));

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => x.setValue(Math.min(0, g.dx)),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -120) onDelete();
          Animated.spring(x, { toValue: 0, useNativeDriver: false }).start();
        },
      }),
    [x, onDelete],
  );

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.fondo}>
        <Text style={estilos.textoFondo}>Borrar</Text>
      </View>
      <Animated.View
        style={[estilos.fila, { transform: [{ translateX: x }] }]}
        {...pan.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 10, borderRadius: 10, overflow: 'hidden' },
  fondo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colores.peligro,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 20,
  },
  textoFondo: { color: colores.blanco, fontWeight: '700' },
  fila: { backgroundColor: colores.blanco, padding: 16 },
});
