import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('lf_profile').then((raw) => {
      try {
        const profile = raw ? JSON.parse(raw) : null;
        setDestination(profile?.name ? '/(tabs)/home' : '/(onboarding)/welcome');
      } catch {
        setDestination('/(onboarding)/welcome');
      }
    });
  }, []);

  if (!destination) return null;
  return <Redirect href={destination as any} />;
}
