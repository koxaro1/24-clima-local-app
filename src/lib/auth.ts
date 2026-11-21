import * as SecureStore from 'expo-secure-store';

const CLAVE = 'token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CLAVE);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CLAVE, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE);
}
