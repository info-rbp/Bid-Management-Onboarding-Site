'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseState = useMemo(() => {
    try {
      const services = initializeFirebase();
      return { ...services, initializationError: null as Error | null };
    } catch (error) {
      const initializationError = error instanceof Error ? error : new Error('Unknown Firebase initialization error.');
      console.error('FirebaseClientProvider: Firebase initialization failed. Continuing without Firebase services.', initializationError);
      return {
        firebaseApp: null,
        auth: null,
        firestore: null,
        initializationError,
      };
    }
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseState.firebaseApp}
      auth={firebaseState.auth}
      firestore={firebaseState.firestore}
      initializationError={firebaseState.initializationError}
    >
      {children}
    </FirebaseProvider>
  );
}
