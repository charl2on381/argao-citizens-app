import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PendingScreen({ route }) {
  const { status, reason } = route.params || {};
  return (
    <View style={styles.c}>
      <Text style={styles.icon}>⏳</Text>
      {status === 'rejected' ? (
        <>
          <Text style={styles.h}>Registration Rejected</Text>
          <Text style={styles.p}>Reason: {reason || 'Contact the municipal office.'}</Text>
        </>
      ) : (
        <>
          <Text style={styles.h}>Pending Approval</Text>
          <Text style={styles.p}>
            Your registration has been submitted and is awaiting approval by a municipal administrator.
            You will be able to log in once approved.
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, padding: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  icon: { fontSize: 60, marginBottom: 20 },
  h: { fontSize: 22, fontWeight: 'bold', color: '#0066cc', marginBottom: 12, textAlign: 'center' },
  p: { textAlign: 'center', color: '#555', lineHeight: 22 },
});