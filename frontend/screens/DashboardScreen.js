import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
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

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quick} onPress={() => navigation.navigate('Services')}>
          <Text style={styles.quickIcon}>📋</Text>
          <Text style={styles.quickT}>All Services</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quick} onPress={() => navigation.navigate('MyApplications')}>
          <Text style={styles.quickIcon}>📁</Text>
          <Text style={styles.quickT}>My Apps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quick} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.quickIcon}>👤</Text>
          <Text style={styles.quickT}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quick, styles.quickDanger]} onPress={logout}>
          <Text style={styles.quickIcon}>↪</Text>
          <Text style={styles.quickT}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Available Services</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} color="#0066cc" />;
  }

  return (
    <FlatList
      data={services}
      keyExtractor={s => String(s.id)}
      ListHeaderComponent={header}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}
        >
          <Text style={styles.cardT}>{item.name}</Text>
          <Text style={styles.cardD}>{item.description}</Text>
          <Text style={styles.cardO}>🏢 {item.office}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>
          No services available.
        </Text>
      }
    />
  );
}

const labelOf = t =>
  ({
    citizen: 'Citizen',
    pwd: 'Person with Disability',
    senior: 'Senior Citizen',
    non_citizen: 'Non-Citizen',
  }[t] || t);

const styles = StyleSheet.create({
  header: { marginBottom: 12 },
  hi: { fontSize: 22, fontWeight: 'bold', color: '#0066cc' },
  sub: { color: '#666', marginBottom: 12 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  quick: { flex: 1, backgroundColor: '#eaf3ff', padding: 10, borderRadius: 10, alignItems: 'center' },
  quickDanger: { backgroundColor: '#ffeaea' },
  quickIcon: { fontSize: 22, marginBottom: 2 },
  quickT: { fontSize: 11, fontWeight: '600', color: '#0066cc', textAlign: 'center' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  section: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#0066cc', fontWeight: '600', fontSize: 13 },
  card: { backgroundColor: '#f5f9ff', borderRadius: 12, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  cardT: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardD: { color: '#444', marginBottom: 6 },
  cardO: { color: '#0066cc', fontSize: 12 },
});