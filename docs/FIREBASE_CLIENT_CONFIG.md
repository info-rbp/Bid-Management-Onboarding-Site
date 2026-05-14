# Firebase Client Configuration (Production)

## What this is

Firebase client configuration is the web-app bootstrap config used by the browser Firebase SDK (`firebase/app`) to initialize Auth/Firestore/Storage.

This config is **public client metadata** and is different from Firebase Admin credentials.

## Required fallback environment variables

If Firebase App Hosting auto-injection is unavailable, configure all of the following:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Preferred Firebase App Hosting path

Preferred behavior is `initializeApp()` with auto-injected web config.

For that to work reliably, the App Hosting backend must be linked to the intended Firebase Web App.

## Important separation from server/admin secrets

These client variables are **not**:

- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- Firebase Admin service account credentials
- Secret Manager admin-only secrets

Admin/server credentials are used by `firebase-admin` on the server only.

## Operational guidance

1. Ensure App Hosting backend is linked to the correct Firebase Web App.
2. If auto-injection fails/unavailable, set all six `NEXT_PUBLIC_FIREBASE_*` vars in hosting environment.
3. Redeploy after any client variable change.
4. Verify in browser console for any of:
   - `Firebase client config is missing`
   - `Firebase: Error (app/no-options)`
   - `Firebase: Error (auth/invalid-api-key)`
   - `API key not valid`

## Production checklist

- [ ] App Hosting backend linked to Firebase Web App
- [ ] Six `NEXT_PUBLIC_FIREBASE_*` values configured (if needed)
- [ ] Fresh deploy completed
- [ ] Homepage `/` loads without global Next.js client crash
- [ ] `/auth` and authenticated paths function as expected
