import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const BASE = (Constants.expoConfig as any)?.extra?.API_URL
  || process.env.EXPO_PUBLIC_API_URL
  || 'https://api.thietkeresort.com.vn';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(async (config: any) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log để debug
console.log('[API] baseURL =', BASE);

export default api;