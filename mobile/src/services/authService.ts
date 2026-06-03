import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

export async function login(email: string, password: string) {
  const res = await apiClient.post('/auth/login', { email, password }, { skipAuth: true } as any);
  const { token, user } = res.data.data;
  await AsyncStorage.setItem('auth_token', token);
  return user;
}

export async function signup(name: string, email: string, password: string) {
  const res = await apiClient.post('/auth/signup', { name, email, password }, { skipAuth: true } as any);
  const { token, user } = res.data.data;
  await AsyncStorage.setItem('auth_token', token);
  return user;
}

export async function logout() {
  await AsyncStorage.removeItem('auth_token');
}

export async function getStoredToken() {
  return AsyncStorage.getItem('auth_token');
}
