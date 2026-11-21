# Bitácora de correcciones a la IA

| Fecha | Tarea | Qué propuso la IA | Qué corregí o rechacé y por qué |
| ----- | ----- | ----------------- | ------------------------------- |

## Corrección: SwipeRow no pasaba el linter

- **Qué propuso la IA:** un componente de gesto que guardaba el valor animado y el callback en useRef y los leía durante el render.
- **Qué falló:** npm run check rompió con 8 errores de react-hooks/refs, y además StyleSheet.absoluteFillObject ya no existe en esta versión de React Native.
- **Qué corregí:** reescribí el componente con useState y useMemo, y cambié a StyleSheet.absoluteFill.
- **Resultado:** npm run check en verde.

## Corrección: el kit se copió incompleto

- **Qué propuso la IA:** un script que copiaba las pantallas al proyecto.
- **Qué falló:** las pantallas no se copiaron y el teléfono seguía mostrando la plantilla de Expo. El check pasaba porque faltaba código, no porque estuviera bien.
- **Qué corregí:** borré index.tsx y explore.tsx de la plantilla, copié las pantallas a mano y regeneré los tipos de rutas con expo start -c.
- **Lección:** que el check pase no prueba que la app funcione; hay que abrirla.
