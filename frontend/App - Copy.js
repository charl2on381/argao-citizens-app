import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PendingScreen from './screens/PendingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AdminScreen from './screens/AdminScreen';

import { getToken, clearToken, api } from './api/client';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        try { setUser(await api('/api/auth/me')); }
        catch { await clearToken(); }
      }
      setLoading(false);
    })();
  }, []);

  const logout = async () => { await clearToken(); setUser(null); };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#0066cc" />
    </View>;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" options={{ title: 'Argao Citizens App' }}>
              {p => <LoginScreen {...p} setUser={setUser} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
            <Stack.Screen name="Pending" component={PendingScreen} options={{ title: 'Pending Approval' }} />
          </>
        ) : user.is_admin ? (
          <Stack.Screen name="Admin" options={{ title: 'Admin Panel' }}>
            {p => <AdminScreen {...p} user={user} logout={logout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard" options={{ title: 'Services' }}>
              {p => <DashboardScreen {...p} user={user} logout={logout} />}
            </Stack.Screen>
            <Stack.Screen name="Profile" options={{ title: 'My Profile' }}>
              {p => <ProfileScreen {...p} user={user} logout={logout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}