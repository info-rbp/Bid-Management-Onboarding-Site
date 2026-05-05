'use client';

import { firebaseConfig, hasExplicitFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export function initializeFirebase() {
  const firebaseApp = getApps().length ? getApp() : initializeFirebaseApp();
  return getSdks(firebaseApp);
}

function initializeFirebaseApp(): FirebaseApp {
  try {
    // Preferred on Firebase App Hosting.
    // App Hosting can automatically provide FIREBASE_WEBAPP_CONFIG.
    return initializeApp();
  } catch (error) {
    // Fallback for local dev, GitHub builds, or non-App-Hosting deployments.
    if (!hasExplicitFirebaseConfig()) {
      throw new Error(
        [
          'Firebase client config is missing.',
          'For Firebase App Hosting, make sure the backend is linked to a Firebase Web App.',
          'For local or GitHub-based builds, set NEXT_PUBLIC_FIREBASE_API_KEY,',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID,',
          'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,',
          'and NEXT_PUBLIC_FIREBASE_APP_ID.',
        ].join(' ')
      );
    }

    return initializeApp(firebaseConfig);
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
