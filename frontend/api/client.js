import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.1.12:4000'; // <-- change me

export async function saveToken(t) { await AsyncStorage.setItem('token', t); }
export async function getToken()   { return AsyncStorage.getItem('token'); }
export async function clearToken() { await AsyncStorage.removeItem('token'); }

export async function api(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}