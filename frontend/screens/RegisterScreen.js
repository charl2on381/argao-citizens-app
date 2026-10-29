import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { api } from '../api/client';

const TYPES = [
  { key: 'citizen', label: 'Citizen' },
  { key: 'pwd', label: 'PWD' },
  { key: 'senior', label: 'Senior' },
  { key: 'non_citizen', label: 'Non-Citizen' },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    user_type: 'citizen', first_name: '', last_name: '', email: '', password: '',
    phone: '', address: '', disability_id: '', senior_id: '',
    passport_no: '', nationality: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      const r = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      Alert.alert('Success', r.message, [
        { text: 'OK', onPress: () => navigation.navigate('Pending', { status: 'pending' }) },
      ]);
    } catch (e) {
      Alert.alert('Registration failed', e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.c} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.lbl}>I am a:</Text>
      <View style={styles.row}>
        {TYPES.map(t => (
          <TouchableOpacity key={t.key} onPress={() => set('user_type', t.key)}
            style={[styles.chip, form.user_type === t.key && styles.chipActive]}>
            <Text style={[styles.chipT, form.user_type === t.key && { color: '#fff' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.i} placeholder="First name" value={form.first_name} onChangeText={v => set('first_name', v)} />
      <TextInput style={styles.i} placeholder="Last name" value={form.last_name} onChangeText={v => set('last_name', v)} />
      <TextInput style={styles.i} placeholder="Email" value={form.email} onChangeText={v => set('email', v)} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.i} placeholder="Password (min 6)" value={form.password} onChangeText={v => set('password', v)} secureTextEntry />
      <TextInput style={styles.i} placeholder="Phone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
      <TextInput style={styles.i} placeholder="Address" value={form.address} onChangeText={v => set('address', v)} />

      {form.user_type === 'pwd' && (
        <TextInput style={styles.i} placeholder="Disability ID Number" value={form.disability_id} onChangeText={v => set('disability_id', v)} />
      )}
      {form.user_type === 'senior' && (
        <TextInput style={styles.i} placeholder="Senior Citizen ID" value={form.senior_id} onChangeText={v => set('senior_id', v)} />
      )}
      {form.user_type === 'non_citizen' && (
        <>
          <TextInput style={styles.i} placeholder="Passport / ACR Number" value={form.passport_no} onChangeText={v => set('passport_no', v)} />
          <TextInput style={styles.i} placeholder="Nationality" value={form.nationality} onChangeText={v => set('nationality', v)} />
        </>
      )}

      <TouchableOpacity style={styles.b} onPress={submit} disabled={loading}>
        <Text style={styles.bt}>{loading ? 'Submitting...' : 'Submit Registration'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  lbl: { fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#0066cc', marginRight: 6, marginBottom: 6 },
  chipActive: { backgroundColor: '#0066cc' },
  chipT: { color: '#0066cc', fontWeight: '600' },
  i: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 10 },
  b: { backgroundColor: '#0066cc', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});