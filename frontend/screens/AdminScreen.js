import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Image,
} from 'react-native';
import { api } from '../api/client';
import { showAlert } from '../api/alert';

const LOGO = require('../assets/argao-logo.png');

export default function AdminScreen({ user, logout }) {
  const [tab, setTab] = useState('users'); // 'users' | 'apps'
  const [filter, setFilter] = useState('pending');
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [remarksId, setRemarksId] = useState(null);
  const [remarks, setRemarks] = useState('');

  // ---------- USERS ----------
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        api(`/api/admin/users?status=${filter}`),
        api('/api/admin/stats'),
      ]);
      setUsers(u);
      setStats(s);
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // ---------- APPLICATIONS ----------
  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const a = await api('/api/admin/applications');
      setApps(a);
    } catch (e) {
      showAlert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else loadApps();
  }, [tab, loadUsers, loadApps]);

  // ---------- ACTIONS ----------
  const approveUser = async (id) => {
    try {
      await api(`/api/admin/users/${id}/approve`, { method: 'POST' });
      loadUsers();
    } catch (e) {
      showAlert('Error', e.message);
    }
  };

  const confirmReject = async () => {
    try {
      await api(`/api/admin/users/${rejectingId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: rejectReason || 'Did not meet requirements' }),
      });
      setRejectingId(null);
      setRejectReason('');
      loadUsers();
    } catch (e) {
      showAlert('Error', e.message);
    }
  };

  const setAppStatus = async (id, status) => {
    try {
      await api(`/api/admin/applications/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          admin_remarks: remarksId === id ? remarks : undefined,
        }),
      });
      setRemarksId(null);
      setRemarks('');
      loadApps();
    } catch (e) {
      showAlert('Error', e.message);
    }
  };

  const FILTERS = ['pending', 'active', 'rejected'];
  const APP_ACTIONS = [
    { key: 'in_review', label: 'In Review', color: '#e0a800' },
    { key: 'approved', label: 'Approve', color: '#28a745' },
    { key: 'rejected', label: 'Reject', color: '#cc3333' },
    { key: 'completed', label: 'Complete', color: '#555' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.hdr}>
        <View style={styles.hdrLeft}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.h}>Admin Panel</Text>
            <Text style={styles.who}>Signed in as {user.first_name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.lo}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('users')}
          style={[styles.tab, tab === 'users' && styles.tabActive]}
        >
          <Text style={[styles.tabT, tab === 'users' && { color: '#fff' }]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('apps')}
          style={[styles.tab, tab === 'apps' && styles.tabActive]}
        >
          <Text style={[styles.tabT, tab === 'apps' && { color: '#fff' }]}>Applications</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- USERS TAB ---------- */}
      {tab === 'users' && (
        <>
          {stats && (
            <View style={styles.statsRow}>
              <Stat label="Pending" value={stats.pending} color="#e0a800" />
              <Stat label="Active" value={stats.active} color="#28a745" />
              <Stat label="Rejected" value={stats.rejected} color="#cc3333" />
            </View>
          )}

          <View style={styles.filterRow}>
            {FILTERS.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.chip, filter === f && styles.chipActive]}
              >
                <Text style={[styles.chipT, filter === f && { color: '#fff' }]}>
                  {f.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#0066cc" />
          ) : (
            <FlatList
              data={users}
              keyExtractor={u => String(u.id)}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.name}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={styles.detail}>
                    {item.user_type} • {item.email}
                  </Text>
                  {item.phone ? <Text style={styles.detail}>📞 {item.phone}</Text> : null}
                  {item.address ? <Text style={styles.detail}>📍 {item.address}</Text> : null}
                  {item.disability_id ? (
                    <Text style={styles.detail}>PWD ID: {item.disability_id}</Text>
                  ) : null}
                  {item.senior_id ? (
                    <Text style={styles.detail}>Senior ID: {item.senior_id}</Text>
                  ) : null}
                  {item.passport_no ? (
                    <Text style={styles.detail}>
                      Passport: {item.passport_no} ({item.nationality})
                    </Text>
                  ) : null}
                  {item.rejection_reason ? (
                    <Text style={[styles.detail, { color: '#cc3333' }]}>
                      Reason: {item.rejection_reason}
                    </Text>
                  ) : null}

                  {item.status === 'pending' && rejectingId !== item.id && (
                    <View style={styles.btnRow}>
                      <TouchableOpacity
                        style={[styles.action, styles.approve]}
                        onPress={() => approveUser(item.id)}
                      >
                        <Text style={styles.actionT}>✓ Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.action, styles.reject]}
                        onPress={() => {
                          setRejectingId(item.id);
                          setRejectReason('');
                        }}
                      >
                        <Text style={styles.actionT}>✕ Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {rejectingId === item.id && (
                    <View style={{ marginTop: 10 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChangeText={setRejectReason}
                      />
                      <View style={styles.btnRow}>
                        <TouchableOpacity
                          style={[styles.action, styles.reject]}
                          onPress={confirmReject}
                        >
                          <Text style={styles.actionT}>Confirm Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.action, { backgroundColor: '#888' }]}
                          onPress={() => setRejectingId(null)}
                        >
                          <Text style={styles.actionT}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No {filter} users.</Text>
              }
            />
          )}
        </>
      )}

      {/* ---------- APPLICATIONS TAB ---------- */}
      {tab === 'apps' && (
        <>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#0066cc" />
          ) : (
            <FlatList
              data={apps}
              keyExtractor={a => String(a.id)}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.name}>{item.service_name}</Text>
                  <Text style={styles.detail}>
                    {item.first_name} {item.last_name} • {item.email}
                  </Text>
                  <Text style={styles.detail}>
                    Type: {item.user_type} • Office: {item.office}
                  </Text>
                  <Text style={styles.detail}>
                    Status:{' '}
                    <Text style={{ fontWeight: '700', color: '#0066cc' }}>
                      {item.status}
                    </Text>{' '}
                    • {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.notes}>User note: {item.notes}</Text>
                  ) : null}
                  {item.admin_remarks ? (
                    <Text style={styles.notes}>Admin remarks: {item.admin_remarks}</Text>
                  ) : null}

                  {remarksId === item.id && (
                    <TextInput
                      style={styles.input}
                      placeholder="Admin remarks (optional)..."
                      value={remarks}
                      onChangeText={setRemarks}
                    />
                  )}

                  <View style={styles.appRow}>
                    {APP_ACTIONS.map(a => (
                      <TouchableOpacity
                        key={a.key}
                        style={[styles.appAction, { backgroundColor: a.color }]}
                        onPress={() => {
                          if (!remarksId) {
                            setRemarksId(item.id);
                            setRemarks('');
                          }
                          setAppStatus(item.id, a.key);
                        }}
                      >
                        <Text style={styles.actionT}>{a.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.empty}>No applications yet.</Text>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const Stat = ({ label, value, color }) => (
  <View style={[styles.statBox, { borderColor: color }]}>
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  hdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  hdrLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 45,
    height: 45,
  },
  h: { fontSize: 20, fontWeight: 'bold', color: '#0066cc' },
  who: { fontSize: 12, color: '#888' },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffeaea',
    borderRadius: 6,
  },
  lo: { color: '#cc3333', fontWeight: '600' },

  tabRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 8 },
  tab: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#0066cc' },
  tabT: { color: '#0066cc', fontWeight: '600' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  statBox: { flex: 1, borderWidth: 2, borderRadius: 10, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: 'bold' },
  statLbl: { fontSize: 12, color: '#666' },

  filterRow: { flexDirection: 'row', padding: 12, gap: 6 },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0066cc',
    alignItems: 'center',
  },
  chipActive: { backgroundColor: '#0066cc' },
  chipT: { color: '#0066cc', fontWeight: '600', fontSize: 12 },

  card: { backgroundColor: '#f9fbff', borderRadius: 10, padding: 12, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: 'bold' },
  detail: { color: '#555', fontSize: 13, marginTop: 2 },
  notes: { color: '#0066cc', fontSize: 13, marginTop: 6 },
  empty: { textAlign: 'center', color: '#888', marginTop: 30 },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  action: { flex: 1, padding: 8, borderRadius: 6, alignItems: 'center' },
  approve: { backgroundColor: '#28a745' },
  reject: { backgroundColor: '#cc3333' },
  actionT: { color: '#fff', fontWeight: 'bold' },

  appRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  appAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    backgroundColor: '#fff',
  },
});