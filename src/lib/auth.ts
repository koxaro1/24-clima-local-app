import * as SecureStore from 'expo-secure-store';

const TOKEN = 'token';
const REFRESH = 'refreshToken';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN);
}

export async function getRefresh(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH);
}

export async function saveSesion(token: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN, token);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function clearSesion(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN);
  await SecureStore.deleteItemAsync(REFRESH);
}
