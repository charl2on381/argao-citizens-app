import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';

const LOGO = require('../assets/argao-logo.png');

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
    <ScrollView style={styles.c} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Header Card with Logo */}
      <View style={styles.headerCard}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.headerName}>{user.first_name} {user.last_name}</Text>
        <Text style={styles.headerType}>{user.user_type.replace('_', ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.h}>Account Details</Text>
        
        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
        
        <TouchableOpacity style={styles.b} onPress={logout}>
          <Text style={styles.bt}>Logout</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f5f9ff' },
  
  headerCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e6eef9',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  headerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  headerType: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    letterSpacing: 1,
  },

  content: {
    paddingHorizontal: 20,
  },
  h: { fontSize: 18, fontWeight: 'bold', color: '#0066cc', marginBottom: 16 },
  
  row: { 
    flexDirection: 'row', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderColor: '#e6eef9' 
  },
  k: { flex: 1, color: '#666', fontWeight: '500' },
  v: { flex: 2, fontWeight: '600', color: '#333' },
  
  b: { 
    backgroundColor: '#cc3333', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 30 
  },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});