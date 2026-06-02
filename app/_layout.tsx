import { useEffect, useRef } from 'react';
import { View } from 'react-native';
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
import { Colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../lib/authContext';
import { LangProvider } from '../lib/LangContext';

function NavigationController() {
  const { isReady, isOnboarded } = useAuth();
  const prev = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const was = prev.current;
    prev.current = isOnboarded;

    // Initial load or state change → always navigate to correct screen
    if (isOnboarded) {
      // Only navigate to home on first load or after completing onboarding
      if (was === null || was === false) {
        router.replace('/(tabs)/home' as any);
      }
    } else {
      // Navigate to welcome on first load or after sign-out
      if (was === null || was === true) {
        router.replace('/(onboarding)/welcome' as any);
      }
    }
  }, [isReady, isOnboarded]);

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
    <AuthProvider>
      <LangProvider>
        <StatusBar style="dark" />
        <NavigationController />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.cream } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </LangProvider>
    </AuthProvider>
  );
}
