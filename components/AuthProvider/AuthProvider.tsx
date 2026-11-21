'use client';

import { useEffect, type ReactNode } from 'react';

import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);

  const clearIsAuthenticated = useAuthStore(
    (state) => state.clearIsAuthenticated,
  );

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const isSessionValid = await checkSession();

        if (!isSessionValid) {
          if (isMounted) {
            clearIsAuthenticated();
          }

          return;
        }

        const user = await getMe();

        if (isMounted) {
          setUser(user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);

        if (isMounted) {
          clearIsAuthenticated();
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [setUser, clearIsAuthenticated]);

  return <>{children}</>;
}
