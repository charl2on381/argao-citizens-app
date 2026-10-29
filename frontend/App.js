import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PendingScreen from './screens/PendingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';
import ServicesScreen from './screens/ServicesScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import MyApplicationsScreen from './screens/MyApplicationsScreen';

import { getToken, clearToken, api } from './api/client';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t = await getToken();
        if (t) {
          const me = await api('/api/auth/me');
          if (!cancelled) setUser(me);
        }
      } catch (e) {
        console.warn('[APP] auth check failed:', e?.message || e);
        try { await clearToken(); } catch {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 🔎 Log every user change so we can see the redirect trigger
  useEffect(() => {
    console.log('[APP] user =', user);
    console.log('[APP] is_admin =', user?.is_admin);
  }, [user]);

  const handleSetUser = (u) => {
    console.log('[APP] setUser called with:', u);
    console.log('[APP] is_admin truthy?', !!(u && u.is_admin));
    setUser(u);
  };

  const logout = async () => {
    try { await clearToken(); } catch {}
    setUser(null);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text style={styles.flag}>🇵🇭</Text>
        <Text style={styles.title}>Argao Registry</Text>
        <Text style={styles.sub}>Municipality of Argao, Cebu</Text>
        <ActivityIndicator size="large" color="#0066cc" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" options={{ title: 'Argao Registry', headerShown: false }}>
              {p => <LoginScreen {...p} setUser={handleSetUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
            <Stack.Screen name="Pending" component={PendingScreen} options={{ title: 'Pending Approval' }} />
          </>
        ) : !!user.is_admin ? (
          <Stack.Screen name="Admin" options={{ title: 'Admin Panel' }}>
            {p => <AdminScreen {...p} user={user} logout={logout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard" options={{ title: 'Argao Services', headerBackVisible: false }}>
              {p => <DashboardScreen {...p} user={user} logout={logout} />}
            </Stack.Screen>
            <Stack.Screen name="Services" component={ServicesScreen} options={{ title: 'All Services' }} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'Service' }} />
            <Stack.Screen name="MyApplications" component={MyApplicationsScreen} options={{ title: 'My Applications' }} />
            <Stack.Screen name="Profile" options={{ title: 'My Profile' }}>
              {p => <ProfileScreen {...p} user={user} logout={logout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  flag: { fontSize: 60, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0066cc' },
  sub: { color: '#666', marginTop: 4 },
});