import { Tabs } from 'expo-router';
import { colores } from '../../lib/theme';

export default function Pestanas() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.acento,
        tabBarLabelStyle: { fontSize: 14 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="ciudades" options={{ title: 'Ciudades' }} />
      <Tabs.Screen name="sensores" options={{ title: 'Sensores' }} />
    </Tabs>
  );
}
