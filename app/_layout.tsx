import { useEffect, useRef } from 'react';
import { View, Platform, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../lib/authContext';
import { LangProvider } from '../lib/LangContext';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const secureStorage = Platform.OS === 'web'
  ? undefined
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

function NavigationController() {
  const { isReady, isAuthenticated, isOnboarded } = useAuth();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;

    // Dev preview bypass — set sessionStorage.ob_preview='1' to skip auth redirects
    if (typeof window !== 'undefined' && sessionStorage?.getItem?.('ob_preview') === '1') return;

    const state = isAuthenticated ? (isOnboarded ? 'home' : 'onboarding') : 'login';
    if (prev.current === state) return;
    prev.current = state;

    if (state === 'home') router.replace('/(tabs)/home' as any);
    else if (state === 'onboarding') {
      // Only push to name on first entry — don't override if user navigated back to signup
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (!path.includes('signup')) router.replace('/(onboarding)/name' as any);
    } else router.replace('/(onboarding)/welcome' as any);
  }, [isReady, isAuthenticated, isOnboarded]);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const bg = scheme === 'dark' ? '#0C0C0C' : Colors.cream;

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: bg }} />;
  }

  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <AuthProvider>
        <LangProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <NavigationController />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </LangProvider>
      </AuthProvider>
    </ConvexAuthProvider>
  );
}
