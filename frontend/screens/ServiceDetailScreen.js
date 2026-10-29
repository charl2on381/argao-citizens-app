import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Image,
} from 'react-native';
import { api } from '../api/client';
import { showAlert } from '../api/alert';

const LOGO = require('../assets/argao-logo.png');

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
    <ScrollView style={{ backgroundColor: '#f5f9ff' }} contentContainerStyle={{ padding: 16 }}>
      
      {/* Official Header Card */}
      <View style={styles.headerCard}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerSub}>Municipality of Argao</Text>
        <Text style={styles.headerTitle}>Official Service Details</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentCard}>
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
      </View>

      {/* Apply Section */}
      <View style={styles.applyCard}>
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
      </View>

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
  headerCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6eef9',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginTop: 2,
  },

  contentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6eef9',
  },
  badge: { alignSelf: 'flex-start', backgroundColor: '#eaf3ff', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  badgeT: { color: '#0066cc', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 10 },
  sectionTitle: { fontWeight: '700', color: '#0066cc', marginBottom: 4 },
  sectionBody: { color: '#333' },

  applyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e6eef9',
  },
  label: { fontWeight: '600', marginBottom: 8 },
  notes: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10,
    textAlignVertical: 'top', minHeight: 80, backgroundColor: '#f9fbff' },
  btn: { backgroundColor: '#0066cc', padding: 14, borderRadius: 10, alignItems: 'center',
    marginTop: 20 },
  btnT: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});