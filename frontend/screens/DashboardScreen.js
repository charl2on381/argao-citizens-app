import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { api } from '../api/client';

export default function DashboardScreen({ navigation, user, logout }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/services')
      .then(setServices)
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, []);

  const header = (
    <View style={styles.header}>
      <Text style={styles.hi}>Welcome, {user.first_name}!</Text>
      <Text style={styles.sub}>{labelOf(user.user_type)}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.btnT}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.danger]} onPress={logout}>
          <Text style={styles.btnT}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.section}>Available Services</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 60 }} color="#0066cc" />;

  return (
    <FlatList
      data={services}
      keyExtractor={s => String(s.id)}
      ListHeaderComponent={header}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardT}>{item.name}</Text>
          <Text style={styles.cardD}>{item.description}</Text>
          <Text style={styles.cardO}>🏢 {item.office}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No services available.</Text>}
    />
  );
}

const labelOf = t => ({ citizen: 'Citizen', pwd: 'Person with Disability', senior: 'Senior Citizen', non_citizen: 'Non-Citizen' }[t] || t);

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  hi: { fontSize: 22, fontWeight: 'bold', color: '#0066cc' },
  sub: { color: '#666', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  btn: { flex: 1, backgroundColor: '#0066cc', padding: 10, borderRadius: 8, alignItems: 'center' },
  danger: { backgroundColor: '#cc3333' },
  btnT: { color: '#fff', fontWeight: '600' },
  section: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  card: { backgroundColor: '#f5f9ff', borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  cardT: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardD: { color: '#444', marginBottom: 6 },
  cardO: { color: '#0066cc', fontSize: 12 },
});