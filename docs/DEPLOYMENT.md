# Deployment Guide

## Hosting target

This application is designed for Firebase App Hosting.

## Required platform services

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase App Hosting
- Firebase Admin credentials available to the server runtime

## Required environment variables

Use `.env.example` as the source of truth.

Critical groups:

1. Firebase client configuration
2. Google Workspace SMTP configuration
3. Google service account credentials for Drive / Sheets
4. Internal secrets for protected operational routes

## Firestore requirements

- Deploy `firestore.rules`
- Ensure the composite index used by `where('userId', '==', uid)` + `orderBy('updatedAt', 'desc')` exists if prompted in the target environment

## Pre-deploy verification

Run:

```bash
npm install
npm run typecheck
npm test
node scripts/audit-validation-anchors.mjs
npm run build
```

## Release checklist

- Firebase client config is available in the target environment
- Firebase Admin credentials are available to server routes
- Firestore rules are deployed
- Storage rules are deployed
- Google Drive parent folder is configured if Drive integration is required
- Google Sheets spreadsheet id is configured if Sheets sync is required
- SMTP credentials are configured if notification emails are required
- Internal route secrets are set for any operational automation calling protected routes

## Post-deploy smoke tests

1. Homepage loads
2. `/auth` loads
3. User signup creates a `users/{uid}` profile
4. Start onboarding creates or resumes a submission
5. Draft save works
6. Final submission locks the onboarding record
7. Drive, Sheets and email integrations behave as expected in the deployed environment
