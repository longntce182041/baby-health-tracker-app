import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setOnUnauthorized } from './src/api/api';
import { navigate } from './src/navigation/navigationRef';

function AppContent() {
  const { logout } = useAuth();

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
      navigate('Login');
    });
  }, [logout]);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
