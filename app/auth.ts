import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'happe_token';
const USER_KEY = 'happe_user';

export const saveSession = async (token: string, user: any) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const getUser = async (): Promise<any | null> => {
  const user = await SecureStore.getItemAsync(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearSession = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};