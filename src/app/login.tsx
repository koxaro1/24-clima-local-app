import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { login, registro } from '../lib/api';
import { saveToken } from '../lib/auth';
import { colores } from '../lib/theme';
import { Boton } from '../components/Boton';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(email: string, clave: string): string | null {
  if (!EMAIL.test(email)) return 'Escribe un correo válido.';
  if (clave.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(crear: boolean) {
    const problema = validar(email.trim(), clave);
    setError(problema);
    if (problema) return;
    setOcupado(true);
    try {
      const f = crear ? registro : login;
      const r = await f(email.trim(), clave);
      await saveToken(r.token);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo continuar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Clima local</Text>
      <TextInput
        style={estilos.campo}
        placeholder="Correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Contraseña (mínimo 8 caracteres)"
        secureTextEntry
        value={clave}
        onChangeText={setClave}
      />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Entrar" onPress={() => void enviar(false)} deshabilitado={ocupado} />
      <Boton
        titulo="Crear cuenta"
        secundario
        onPress={() => void enviar(true)}
        deshabilitado={ocupado}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, backgroundColor: colores.fondo },
  titulo: { fontSize: 32, fontWeight: '800', color: colores.tinta, marginBottom: 20 },
  campo: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  error: { color: colores.peligro, marginBottom: 4 },
});
