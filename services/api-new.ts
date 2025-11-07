// api.ts - 1 nguồn sự thật, không rẽ nhánh lung tung
import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

function resolveBaseUrl() {
  const extra = (Constants.expoConfig as any)?.extra || (Constants.manifest as any)?.extra;
  const envUrl = extra?.API_URL || process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  // Fallback DEV
  if (__DEV__) {
    return Platform.select({
      ios: 'http://localhost:3001',
      android: 'http://10.0.2.2:3001',
      default: 'http://192.168.0.2:3001',
    })!;
  }

  // Fallback PROD
  return 'https://api.thietkeresort.com.vn';
}

export const API_BASE = resolveBaseUrl();

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log ra để bạn thấy chắc chắn đang dùng URL nào
console.log('[API] baseURL =', API_BASE);

export default api;