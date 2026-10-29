import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ user, logout }) {
  const rows = [
    ['Name', `${user.first_name} ${user.last_name}`],
    ['Email', user.email],
    ['Type', user.user_type],
    ['Phone', user.phone || '—'],
    ['Address', user.address || '—'],
    ['Status', user.status],
  ];
  if (user.disability_id) rows.push(['Disability ID', user.disability_id]);
  if (user.senior_id) rows.push(['Senior ID', user.senior_id]);
  if (user.passport_no) rows.push(['Passport/ACR', user.passport_no]);
  if (user.nationality) rows.push(['Nationality', user.nationality]);

  return (
    <ScrollView style={{ padding: 20, backgroundColor: '#fff' }}>
      <Text style={styles.h}>My Profile</Text>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.row}>
          <Text style={styles.k}>{k}</Text>
          <Text style={styles.v}>{v}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.b} onPress={logout}>
        <Text style={styles.bt}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 22, fontWeight: 'bold', color: '#0066cc', marginBottom: 16 },
  row: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  k: { flex: 1, color: '#666' },
  v: { flex: 2, fontWeight: '500' },
  b: { backgroundColor: '#cc3333', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  bt: { color: '#fff', fontWeight: 'bold' },
});