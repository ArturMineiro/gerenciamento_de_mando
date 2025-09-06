import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getToken } from './storage';

function resolveBaseURL() {
  const extra = Constants.expoConfig?.extra as any;
  if (extra?.apiUrl) return extra.apiUrl as string;
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

export const api = axios.create({
  baseURL: resolveBaseURL() + '/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
