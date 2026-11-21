import { Stack } from 'expo-router';

export default function Raiz() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar ciudad' }} />
    </Stack>
  );
}
