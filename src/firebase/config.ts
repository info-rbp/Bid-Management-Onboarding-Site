import { initializeApp, getApps, getApp } from 'firebase/app';

let config;

try {
  config = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
} catch (e) {
  config = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "business-plan-applicatio-17047",
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: "235655512140",
  };
}

export const firebaseConfig = config;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };

if (process.env.NODE_ENV === 'development' && !firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. Check your .env.local file.");
}
