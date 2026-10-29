import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Detect if the app is running on the web OR on a phone
// Just use the LAN IP for everything to be safe during testing.
export const API_URL = 'http://192.168.1.12:4000'; 

export async function saveToken(t) { await AsyncStorage.setItem('token', t); }
export async function getToken()   { return AsyncStorage.getItem('token'); }
export async function clearToken() { await AsyncStorage.removeItem('token'); }

export async function api(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (netErr) {
    const err = new Error(`Network error: cannot reach ${API_URL}`);
    err.status = 0;
    err.data = { message: err.message };
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}