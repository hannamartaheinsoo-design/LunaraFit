import React, { createContext, useContext } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../convex/_generated/api';

interface AuthContextType {
  isReady: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isReady: false,
  isAuthenticated: false,
  isOnboarded: false,
  signOut: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut: convexSignOut } = useAuthActions();
  const profile = useQuery(api.profiles.get, isAuthenticated ? {} : 'skip');

  const isReady = !isLoading && (profile !== undefined || !isAuthenticated);
  // True only after the user explicitly completes the full onboarding flow (ready screen).
  // Legacy profiles with a name but no onboarding_complete are treated as complete so
  // existing users are not forced back through onboarding.
  const isOnboarded = isAuthenticated && !!(
    profile?.onboarding_complete === true ||
    (profile?.name && profile?.fitness_level)
  );

  const signOut = async () => {
    await convexSignOut();
  };

  // refreshAuth is a no-op — Convex queries are reactive
  const refreshAuth = async () => {};

  return (
    <AuthContext.Provider value={{ isReady, isAuthenticated, isOnboarded, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
