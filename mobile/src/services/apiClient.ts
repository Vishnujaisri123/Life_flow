import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:5000/api'; // Android emulator → localhost
// For physical device: replace with your machine's LAN IP e.g. http://192.168.1.x:5000/api

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiClient.get(path);
  return res.data.data;
}

export async function apiPost<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.post(path, data);
  return res.data.data;
}

export async function apiPut<T>(path: string, data?: unknown): Promise<T> {
  const res = await apiClient.put(path, data);
  return res.data.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiClient.delete(path);
  return res.data.data;
}
