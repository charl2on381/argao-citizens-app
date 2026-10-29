import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../api/client';
import { showAlert } from '../api/alert';

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      const [s, c] = await Promise.all([
        api(`/api/services?${params}`),
        api('/api/services/categories'),
      ]);
      setServices(s);
      setCategories(c);
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [q, cat]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 12 }}>
        <TextInput
          style={styles.search}
          placeholder="🔍 Search services..."
          value={q}
          onChangeText={setQ}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <TouchableOpacity onPress={() => setCat(null)} style={[styles.chip, !cat && styles.chipActive]}>
            <Text style={[styles.chipT, !cat && { color: '#fff' }]}>All</Text>
          </TouchableOpacity>
          {categories.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)}
              style={[styles.chip, cat === c && styles.chipActive]}>
              <Text style={[styles.chipT, cat === c && { color: '#fff' }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={s => String(s.id)}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ServiceDetail', { id: item.id })}>
              <View style={styles.badge}><Text style={styles.badgeT}>{item.category}</Text></View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>🏢 {item.office}</Text>
                <Text style={styles.meta}>⏱ {item.processing_time || '—'}</Text>
              </View>
              <Text style={styles.more}>View details →</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No services match your filters.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    borderColor: '#0066cc', marginRight: 8 },
  chipActive: { backgroundColor: '#0066cc' },
  chipT: { color: '#0066cc', fontWeight: '600', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e6eef9' },
  badge: { alignSelf: 'flex-start', backgroundColor: '#eaf3ff', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 6, marginBottom: 6 },
  badgeT: { color: '#0066cc', fontSize: 11, fontWeight: '600' },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  desc: { color: '#555', marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  meta: { color: '#777', fontSize: 12 },
  more: { color: '#0066cc', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});