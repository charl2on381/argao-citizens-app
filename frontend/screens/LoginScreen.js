import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api, saveToken } from '../api/client';

export default function LoginScreen({ navigation, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill all fields');
    setLoading(true);
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await saveToken(data.token);
      setUser(data.user);
    } catch (e) {
      if (e.status === 403 && e.data?.status) {
        navigation.navigate('Pending', { status: e.data.status, reason: e.data.rejection_reason });
      } else {
        Alert.alert('Login failed', e.message);
      }
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.h}>🇵🇭 Argao Registry</Text>
      <Text style={styles.sub}>Municipality of Argao, Cebu</Text>
      <TextInput style={styles.i} placeholder="Email" value={email}
        onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.i} placeholder="Password" value={password}
        onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.b} onPress={submit} disabled={loading}>
        <Text style={styles.bt}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.l}>No account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  h: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#0066cc' },
  sub: { textAlign: 'center', color: '#666', marginBottom: 30 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  b: { backgroundColor: '#0066cc', padding: 14, borderRadius: 8, alignItems: 'center' },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  l: { textAlign: 'center', color: '#0066cc', marginTop: 16 },
});