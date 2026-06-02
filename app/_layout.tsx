import { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  Jost_700Bold,
} from '@expo-google-fonts/jost';
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

    const state = isAuthenticated ? (isOnboarded ? 'home' : 'onboarding') : 'login';
    if (prev.current === state) return;
    prev.current = state;

    if (state === 'home') router.replace('/(tabs)/home' as any);
    else if (state === 'onboarding') router.replace('/(onboarding)/welcome' as any);
    else router.replace('/(auth)/login' as any);
  }, [isReady, isAuthenticated, isOnboarded]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
    Jost_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: Colors.cream }} />;
  }

  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <AuthProvider>
        <LangProvider>
          <StatusBar style="dark" />
          <NavigationController />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.cream } }}>
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
