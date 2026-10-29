import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Image,
} from 'react-native';
import { api, saveToken } from '../api/client';
import { showAlert } from '../api/alert';

// Import the logo
const LOGO = require('../assets/argao-logo.png');

export default function LoginScreen({ navigation, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return showAlert('Error', 'Fill all fields');
    setLoading(true);
    try {
      console.log('[LOGIN] POST /api/auth/login');
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('[LOGIN] response:', data);
      console.log('[LOGIN] data.user.is_admin:', data.user?.is_admin);
      await saveToken(data.token);
      console.log('[LOGIN] calling setUser');
      setUser(data.user);
    } catch (e) {
      console.log('[LOGIN] error:', e.status, e.message, e.data);
      if (e.status === 403 && e.data?.status) {
        navigation.navigate('Pending', {
          status: e.data.status,
          reason: e.data.rejection_reason,
        });
      } else {
        showAlert('Login failed', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.c}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.h}>Argao Citizen Registry App</Text>
      <Text style={styles.sub}>Municipality of Argao, Cebu</Text>

      <TextInput
        style={styles.i}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.b, loading && { opacity: 0.7 }]}
        onPress={submit}
        disabled={loading}
      >
        <Text style={styles.bt}>{loading ? 'Logging in…' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={styles.l}>No account? Register</Text>
      </TouchableOpacity>

      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.overlayBox}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.overlayText}>Signing you in…</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 120,
  },

  h: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#0066cc' },
  sub: { textAlign: 'center', color: '#666', marginBottom: 30 },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
  b: { backgroundColor: '#0066cc', padding: 14, borderRadius: 8, alignItems: 'center' },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  l: { textAlign: 'center', color: '#0066cc', marginTop: 16 },
  
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  overlayBox: { backgroundColor: '#fff', padding: 28, borderRadius: 16, alignItems: 'center', minWidth: 240 },
  overlayText: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#0066cc' },
});