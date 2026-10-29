import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { api } from '../api/client';
import { showAlert } from '../api/alert';

export default function ServiceDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [svc, setSvc] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    api(`/api/services/${id}`)
      .then(setSvc)
      .catch(e => showAlert('Error', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    setApplying(true);
    try {
      const r = await api(`/api/services/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      showAlert('Application Submitted', r.message, [
        { text: 'OK', onPress: () => navigation.navigate('MyApplications') },
      ]);
      setNotes('');
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 60 }} />;
  if (!svc) return <Text style={{ padding: 20 }}>Service not found.</Text>;

  return (
    <ScrollView style={{ backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.badge}><Text style={styles.badgeT}>{svc.category}</Text></View>
      <Text style={styles.title}>{svc.name}</Text>
      <Text style={styles.desc}>{svc.description}</Text>

      <Section title="🏢 Office" body={svc.office} />
      <Section title="⏱ Processing Time" body={svc.processing_time || 'Not specified'} />
      <Section title="💰 Fee" body={svc.fee || 'Free'} />
      <Section title="📞 Contact"
        body={`${svc.contact_person || '—'} ${svc.contact_number ? '• ' + svc.contact_number : ''}`} />
      <Section title="📋 Requirements" body={svc.requirements} preserve />
      <Section title="📝 Process" body={svc.process_steps} preserve />

      <Text style={styles.label}>Additional notes (optional)</Text>
      <TextInput
        style={styles.notes}
        multiline
        numberOfLines={3}
        placeholder="Any information the office should know..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.btn} onPress={apply} disabled={applying}>
        <Text style={styles.btnT}>{applying ? 'Submitting...' : 'Apply for this Service'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Section = ({ title, body, preserve }) => (
  <View style={{ marginTop: 14 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={[styles.sectionBody, preserve && { lineHeight: 22 }]}>
      {body || 'Not specified'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', backgroundColor: '#eaf3ff', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeT: { color: '#0066cc', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 15, color: '#333', lineHeight: 22 },
  sectionTitle: { fontWeight: '700', color: '#0066cc', marginBottom: 4 },
  sectionBody: { color: '#333' },
  label: { marginTop: 20, fontWeight: '600', marginBottom: 6 },
  notes: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10,
    textAlignVertical: 'top', minHeight: 80 },
  btn: { backgroundColor: '#0066cc', padding: 14, borderRadius: 10, alignItems: 'center',
    marginTop: 20, marginBottom: 40 },
  btnT: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});