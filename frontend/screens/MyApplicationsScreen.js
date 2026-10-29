import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, StyleSheet, ActivityIndicator, 
  RefreshControl, Image 
} from 'react-native';
import { api } from '../api/client';

const LOGO = require('../assets/argao-logo.png');

const STATUS_COLOR = {
  submitted: '#0066cc',
  in_review: '#e0a800',
  approved: '#28a745',
  rejected: '#cc3333',
  completed: '#555',
};
const STATUS_LABEL = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

export default function MyApplicationsScreen() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api('/api/services/applications/mine');
      setApps(r);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 60 }} />;

  const Header = () => (
    <View style={styles.headerContainer}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.headerTitle}>My Applications</Text>
      <Text style={styles.headerSub}>Track the status of your requests</Text>
    </View>
  );

  return (
    <FlatList
      style={{ backgroundColor: '#f5f9ff' }}
      contentContainerStyle={{ padding: 16 }}
      data={apps}
      keyExtractor={a => String(a.id)}
      ListHeaderComponent={Header}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      ListEmptyComponent={
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
          You have no applications yet.{'\n'}Browse services to get started.
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.service_name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] }]}>
              <Text style={styles.statusT}>{STATUS_LABEL[item.status]}</Text>
            </View>
          </View>
          <Text style={styles.meta}>🏢 {item.office} • {item.category}</Text>
          <Text style={styles.meta}>📅 {new Date(item.created_at).toLocaleDateString()}</Text>
          {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
          {item.admin_remarks ? (
            <Text style={styles.remarks}>💬 Admin: {item.admin_remarks}</Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6eef9',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  headerSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  card: { 
    backgroundColor: '#fff', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 10,
    borderLeftWidth: 4, 
    borderLeftColor: '#0066cc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusT: { color: '#fff', fontSize: 11, fontWeight: '700' },
  meta: { color: '#666', fontSize: 13, marginTop: 2 },
  notes: { color: '#444', fontSize: 13, marginTop: 6, fontStyle: 'italic' },
  remarks: { color: '#0066cc', fontSize: 13, marginTop: 6 },
});