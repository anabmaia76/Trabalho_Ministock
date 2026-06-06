import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });

  const token = data.token || (data as any).accessToken;

  if (!token) {
    throw new Error('Token não encontrado na resposta.');
  }

  await AsyncStorage.setItem('@ministock_token', token);
  return { ...data, token };
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem('@ministock_token');
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem('@ministock_token');
}