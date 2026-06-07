import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});

// Guarda a função de logout para usar no interceptor
let _onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(fn: () => void) {
  _onUnauthorized = fn;
}

// Interceptor de REQUEST — injeta o token automaticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@ministock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE — tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Sem conexão ou timeout
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error('Sem conexão, tente novamente.'));
    }

    const status = error.response?.status;

    if (status === 400) {
      return Promise.reject(new Error('Usuário ou senha incorretos.'));
    }

    if (status === 401) {
      await AsyncStorage.removeItem('@ministock_token');
      if (_onUnauthorized) _onUnauthorized();
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('Recurso não encontrado.'));
    }

    if (status >= 500) {
      return Promise.reject(new Error('Erro no servidor, tente novamente.'));
    }

    return Promise.reject(error);
  }
);