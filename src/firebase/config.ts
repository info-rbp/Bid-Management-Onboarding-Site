export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "business-plan-applicatio-17047",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: "235655512140", // Hardcoded fallback for stability
};

// Log a warning in development if API Key is missing
if (process.env.NODE_ENV === 'development' && !firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing. Check your .env.local file.");
}
