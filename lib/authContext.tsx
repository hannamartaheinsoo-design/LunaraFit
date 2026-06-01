import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isReady: boolean;
  isOnboarded: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isReady: false,
  isOnboarded: false,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('lf_profile');
      const profile = raw ? JSON.parse(raw) : null;
      setIsOnboarded(!!(profile?.name));
    } catch {
      setIsOnboarded(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setIsReady(true));
  }, [refreshAuth]);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['lf_profile', 'lf_workouts', 'lf_cycle_days']);
    } catch {}
    setIsOnboarded(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isReady, isOnboarded, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
