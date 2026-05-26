# Bid Manager Onboarding Site

Production-oriented client onboarding application for Remote Business Partner's bid-management service.

## What the application does

- Authenticates client users with Firebase Authentication
- Collects a multi-step onboarding submission in Firestore
- Stores uploaded onboarding documents in Firebase Storage
- Finalizes submissions through server-side Next.js API routes
- Optionally creates or reuses a Google Drive folder for the submission
- Optionally syncs submission data to Google Sheets
- Sends internal notification emails for signup and completed onboarding

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Firebase Auth, Firestore, Storage
- Firebase Admin for privileged server-side access
- Google Drive API
- Google Sheets API
- Nodemailer / Google Workspace SMTP

## Local setup

1. Install dependencies

```bash
npm install
```

2. Copy `.env.example` into your local environment and populate the required values.

3. Start the development server

```bash
npm run dev
```

The app runs on `http://localhost:9002`.

## Environment configuration

See:

- `.env.example`
- `docs/FIREBASE_CLIENT_CONFIG.md`
- `docs/DEPLOYMENT.md`

## Verification commands

```bash
npm run typecheck
npm test
npm run build
node scripts/audit-validation-anchors.mjs
```

## Operational notes

- Client onboarding creation is server-owned through `POST /api/onboarding-submissions/start`
- Final submission is server-owned through `POST /api/onboarding/finalize`
- Google Sheets retry sync is available through `POST /api/onboarding-submissions/sync-sheet`
- Firestore rules intentionally block clients from changing server-managed submission state such as final status, Drive metadata and Sheets sync metadata

## Deployment

The repository is configured for Firebase App Hosting. See `docs/DEPLOYMENT.md` for:

- required environment variables
- Firebase service wiring
- Google API integration setup
- build and release verification
- post-deploy checks
