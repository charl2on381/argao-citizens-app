import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { api } from '../api/client';
import { showAlert } from '../api/alert';

const TYPES = [
  { key: 'citizen', label: 'Citizen', icon: '🏛️' },
  { key: 'pwd', label: 'PWD', icon: '♿' },
  { key: 'senior', label: 'Senior', icon: '👴' },
  { key: 'non_citizen', label: 'Non-Citizen', icon: '🌏' },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    user_type: 'citizen',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    disability_id: '',
    senior_id: '',
    passport_no: '',
    nationality: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.first_name || !form.last_name) return 'First and last name required';
    if (!form.email) return 'Email required';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.user_type === 'pwd' && !form.disability_id) return 'Disability ID required for PWD';
    if (form.user_type === 'senior' && !form.senior_id) return 'Senior ID required';
    if (form.user_type === 'non_citizen' && (!form.passport_no || !form.nationality))
      return 'Passport number and nationality required for non-citizens';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return showAlert('Incomplete', err);

    setLoading(true);
    try {
      const r = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showAlert('Success', r.message, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Pending', { status: 'pending' }),
        },
      ]);
    } catch (e) {
      showAlert('Registration failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.c}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.sub}>All registrations are reviewed by a municipal admin</Text>

      {/* Type selector */}
      <Text style={styles.lbl}>I am a:</Text>
      <View style={styles.typeRow}>
        {TYPES.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => set('user_type', t.key)}
            style={[styles.typeChip, form.user_type === t.key && styles.typeChipActive]}
          >
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text
              style={[styles.typeLabel, form.user_type === t.key && { color: '#fff' }]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Common fields */}
      <Text style={styles.section}>Personal Information</Text>
      <TextInput
        style={styles.i}
        placeholder="First name *"
        value={form.first_name}
        onChangeText={v => set('first_name', v)}
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Last name *"
        value={form.last_name}
        onChangeText={v => set('last_name', v)}
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Email *"
        value={form.email}
        onChangeText={v => set('email', v)}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Password (min 6 chars) *"
        value={form.password}
        onChangeText={v => set('password', v)}
        secureTextEntry
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Phone (optional)"
        value={form.phone}
        onChangeText={v => set('phone', v)}
        keyboardType="phone-pad"
        editable={!loading}
      />
      <TextInput
        style={styles.i}
        placeholder="Address (optional)"
        value={form.address}
        onChangeText={v => set('address', v)}
        editable={!loading}
      />

      {/* Type-specific fields */}
      {form.user_type === 'pwd' && (
        <>
          <Text style={styles.section}>PWD Details</Text>
          <TextInput
            style={styles.i}
            placeholder="Disability ID Number *"
            value={form.disability_id}
            onChangeText={v => set('disability_id', v)}
            editable={!loading}
          />
        </>
      )}

      {form.user_type === 'senior' && (
        <>
          <Text style={styles.section}>Senior Citizen Details</Text>
          <TextInput
            style={styles.i}
            placeholder="Senior Citizen ID *"
            value={form.senior_id}
            onChangeText={v => set('senior_id', v)}
            editable={!loading}
          />
        </>
      )}

      {form.user_type === 'non_citizen' && (
        <>
          <Text style={styles.section}>Non-Citizen Details</Text>
          <TextInput
            style={styles.i}
            placeholder="Passport / ACR Number *"
            value={form.passport_no}
            onChangeText={v => set('passport_no', v)}
            editable={!loading}
          />
          <TextInput
            style={styles.i}
            placeholder="Nationality *"
            value={form.nationality}
            onChangeText={v => set('nationality', v)}
            editable={!loading}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.b, loading && { opacity: 0.6 }]}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.bt}>Submitting…</Text>
          </View>
        ) : (
          <Text style={styles.bt}>Submit Registration</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.back}>← Back to Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#0066cc' },
  sub: { color: '#666', marginBottom: 20 },
  lbl: { fontWeight: '600', marginBottom: 8 },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  typeChipActive: { backgroundColor: '#0066cc' },
  typeIcon: { fontSize: 14, marginRight: 4 },
  typeLabel: { color: '#0066cc', fontWeight: '600', fontSize: 13 },

  section: {
    fontWeight: '700',
    color: '#0066cc',
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  i: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  b: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  back: { textAlign: 'center', color: '#0066cc', marginTop: 16, fontWeight: '600' },
});