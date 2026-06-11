// client-user/src/navigation/AppNavigator.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack.jsx';
import MainTabs from './MainTabs.jsx';
import { useAuthStore } from '../store/authStore.js';
import { LoadingSpinner } from '../components/common/Common.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../shared/constants/theme.js';

export default function AppNavigator() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!_hasHydrated && !timedOut) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm
  },
  subtitle: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    marginBottom: SPACING.lg
  },
  button: {
    width: '100%',
    maxWidth: 260
  }
});
