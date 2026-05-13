# Onboarding Repair Summary

## Purpose

This document summarises the onboarding application repair programme for the Bid Management Onboarding Site.

The repair programme addressed production safety issues, validation UX failures, dependency/security remediation, external integration hardening, authentication hardening, duplicate-submission prevention, and final regression QA requirements.

## Executive summary

The onboarding application had several risk areas:

1. Build and lint/type errors could be ignored during production builds.
2. Validation failures could block progression without clear scroll targets or useful inline feedback.
3. Section 12 Service Modules could appear to hang on save because hidden or poorly surfaced validation errors blocked progress.
4. Google Sheets sync used append-style behaviour that could duplicate rows on retries.
5. Google Drive folder creation could create duplicate folders on retries.
6. Notification routes could be abused if left public and body-driven.
7. Finalisation previously risked trusting client-supplied ownership data.
8. Onboarding start/resume behaviour allowed duplicate submissions from client-side creation paths.
9. AuthGuard profile repair failures did not surface a recoverable UI.
10. Regression QA documentation was missing.

The programme has now substantially remediated these items through a series of focused batches.

## Repair batch overview

| Batch | Area | Status |
|---|---|---|
| Batch 1 | Production footguns / build safety | Complete |
| Batch 2 | Submission save flow stabilisation | Complete |
| Batch 3 | Secure finalisation | Complete |
| Batch 4 / 4B | Validation UX and validation anchors | Complete |
| Batch 5 | Dependency/security remediation | Complete |
| Batch 6 | External integrations hardening | Complete |
| Batch 7 | Auth and duplicate-submission hardening | Complete |
| Batch 8 | Regression QA docs and final checklist | Complete when this document and QA checklist are merged |

## Key outcomes

### Build safety restored

Dangerous Next.js config bypasses were removed.

The application should no longer ignore TypeScript or ESLint failures during production builds.

Expected build output includes:

```text
Linting and checking validity of types
```

This avoids silently shipping broken builds. Which is apparently something frameworks will happily allow if invited to the party.

### Validation UX repaired

Validation UX now includes:

- Validation summary support
- Jump-to-field handling
- Inline field errors
- Validation anchors
- Audit script coverage

The validation anchor audit expects:

```text
Validation keys found: 121
Anchors found: 121
Allowlisted composite anchors: 0
```

This directly supports the original Service Modules issue where users could be blocked from progressing without a clear visible field-level problem.

### Section 12 Service Modules repaired

The original client-reported issue involved Section 12 “Service Modules” getting stuck on saving/progression.

Relevant fixes included:

- Wiring validation anchors for remaining onboarding sections
- Ensuring Service Modules validation fields have scroll targets
- Preserving validation summary jump handling
- Avoiding permanent “saving draft” UX when validation blocks progression
- Adding/maintaining section status updates for incomplete required fields

Specific Section 12A fields requiring regression coverage:

- `tenderSupplierReadiness.realisticContractSizes`
- `tenderSupplierReadiness.preparedForComplianceRequirements`
- `tenderSupplierReadiness.previousMaterialsAvailable`
- `tenderSupplierReadiness.submissionApprover`
- `tenderSupplierReadiness.contractTermsApprover`

### Dependency/security remediation completed

Batch 5 reduced npm audit findings from 29 vulnerabilities to 21 through safe, non-forced remediation.

Actions included:

- Ran non-forced `npm audit fix`
- Updated Next.js
- Updated PostCSS
- Updated Firebase
- Updated Firebase Admin
- Updated Genkit packages
- Updated Nodemailer
- Updated Vitest/Vite/esbuild-related packages
- Documented remaining advisories in `SECURITY_NOTES.md`
- Avoided `npm audit fix --force`

Remaining advisories are documented rather than silently ignored. Civilization, barely.

### Google Sheets sync hardened

Batch 6 replaced append-only sync behaviour with idempotent sync behaviour keyed by `Submission ID`.

Implemented behaviour:

- Summary sheet:
  - Find existing row by `Submission ID`
  - Update existing row if present
  - Append one row only if missing

- Answers sheet:
  - Find rows by `Submission ID`
  - Delete old answer rows
  - Append regenerated answer rows

- Backfill script:
  - Retry-safe
  - Updates existing summary rows
  - Deletes/regenerates answer rows
  - Reports created/updated/deleted/appended counts

This reduces duplicate row risk when users retry submission, admins rerun backfill, or sync calls are repeated.

### Google Drive finalisation hardened

Drive folder handling now uses idempotent folder creation/reuse.

Implemented behaviour:

- Sanitised onboarding Drive folder names
- Folder names include `submissionId`
- Uses `GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID` when configured
- Reuses existing `googleDriveFolderId` / `googleDriveFolderUrl`
- Uses get-or-create behaviour to avoid duplicate folders on retry

Expected folder name pattern:

```text
Onboarding - <Business Name> - <submissionId>
```

### Notification hardening completed

Notification handling was hardened to avoid arbitrary public email sending.

Implemented behaviour:

- Onboarding submitted notification is sent server-side from finalisation
- Notification data is fetched server-side
- Notification failure is logged and does not corrupt finalisation
- Notification routes are protected by Firebase bearer token or internal secret
- Signup notification route fetches profile data server-side
- Email fields are sanitised/validated through shared helpers

### Finalisation security hardened

Finalisation now requires Firebase bearer token verification.

Implemented behaviour:

- Requires `Authorization: Bearer <Firebase ID token>`
- Verifies token server-side
- Uses `decodedToken.uid` for ownership checks
- Does not trust `userId` from request body
- Verifies submission exists and belongs to authenticated user
- Preserves final submission snapshot behaviour
- Reuses/creates Drive folder safely
- Sends onboarding-submitted notification server-side

### Duplicate-submission hardening completed

Batch 7 added server-side start/resume handling.

Implemented behaviour:

- Added `POST /api/onboarding-submissions/start`
- Requires Firebase bearer token
- Uses `decodedToken.uid`
- Uses `users/{uid}.activeOnboardingSubmissionId` as the primary active submission lock
- Returns an existing active submission when available
- Falls back to latest active submission lookup
- Creates a new submission only when no active submission exists
- Sets `activeOnboardingSubmissionId` on the user profile

Client-side onboarding creation was removed from:

- Dashboard
- Start Onboarding button
- Onboarding page bootstrap

Expected grep checks:

```bash
grep -R "addDoc(collection(db, 'onboardingSubmissions')" -n src || true
grep -R "setDoc(doc(db, 'onboardingSubmissions'" -n src/app src/components || true
grep -R "api/onboarding-submissions/start" -n src || true
```

Expected result:

- No client-side `addDoc(collection(db, 'onboardingSubmissions')`
- No client-side `setDoc(doc(db, 'onboardingSubmissions'...)`
- `/api/onboarding-submissions/start` appears in dashboard, onboarding page, and start button

### AuthGuard repair handling completed

AuthGuard now surfaces profile repair failures with a visible UI.

Implemented behaviour:

- Detects profile verification/repair failure
- Shows visible profile repair error card
- Includes Retry profile repair action
- Includes Sign out action
- Prevents silent protected-content continuation after profile repair failure
- Avoids uncontrolled infinite repair loops

## Major files changed

### Build and validation

- `next.config.ts`
- `scripts/audit-validation-anchors.mjs`
- `src/components/ValidationSummary.tsx`
- `src/components/FieldError.tsx`
- onboarding section component files under `src/app/onboarding/*`
- `src/lib/onboardingValidation.ts`

### Dependency/security remediation

- `package.json`
- `package-lock.json`
- `SECURITY_NOTES.md`

### External integrations

- `src/lib/google-sheets/onboarding-submissions.ts`
- `src/app/api/onboarding-submissions/sync-sheet/route.ts`
- `scripts/backfill-onboarding-submissions-to-sheets.mjs`
- `src/lib/google-drive.ts`
- `src/lib/notifications.ts`
- `src/app/api/notifications/onboarding-submitted/route.ts`
- `src/app/api/notifications/signup/route.ts`
- `src/app/api/onboarding/finalize/route.ts`

### Auth and submission hardening

- `src/app/api/onboarding-submissions/start/route.ts`
- `src/app/dashboard/page.tsx`
- `src/components/home/StartOnboardingButton.tsx`
- `src/app/onboarding/[stepId]/page.tsx`
- `src/components/auth/AuthGuard.tsx`
- `src/lib/auth-return-url.ts`
- `src/lib/auth-return-url.spec.ts`
- `src/lib/onboarding-submission.ts`

## Verification commands

Run these before merging or releasing.

```bash
npm install
npm run typecheck
npm test
node scripts/audit-validation-anchors.mjs
npm run build
```

Expected results:

| Check | Expected |
|---|---|
| Typecheck | Pass |
| Tests | Pass |
| Validation anchor audit | 121/121 anchors |
| Production build | Pass |

## Safety grep checks

Run these after Batch 7 and before release.

```bash
grep -R "addDoc(collection(db, 'onboardingSubmissions')" -n src || true
grep -R "setDoc(doc(db, 'onboardingSubmissions'" -n src/app src/components || true
grep -R "api/onboarding-submissions/start" -n src || true
grep -R "/api/notifications/submission" -n src || true
grep -R "const { submissionId, userId, finalSubmission }" -n src || true
```

Expected results:

| Check | Expected |
|---|---|
| Client-side onboarding `addDoc` | No results |
| Client-side onboarding `setDoc` | No results |
| Start route references | Present in dashboard/start/onboarding bootstrap |
| Obsolete notification endpoint | No results |
| Finalisation body `userId` trust | No results |

## Manual QA required

Before production release, complete `docs/QA_ONBOARDING_REGRESSION_CHECKLIST.md`.

Minimum critical tests:

1. New user starts onboarding and exactly one active submission is created.
2. Double-click Start Onboarding and confirm no duplicate active submissions.
3. Open onboarding in two tabs and confirm both resolve to the same active submission.
4. Complete Section 12A Service Modules and confirm save/progression works.
5. Trigger validation in Section 12A and confirm summary links scroll to fields.
6. Complete final submission and confirm finalisation succeeds.
7. Retry finalisation and confirm no duplicate Drive folder.
8. Sync the same submission to Sheets twice and confirm no duplicate summary row.
9. Run backfill twice and confirm retry safety.
10. Confirm notification routes reject unauthenticated arbitrary requests.
11. Simulate AuthGuard profile repair failure and confirm retry/sign-out UI appears.

## Deployment considerations

### Required secrets/configuration

Confirm these are available in deployment:

- Firebase public config
- Firebase Admin credentials
- Google Drive credentials/config
- Google Sheets credentials/config
- Google Workspace email credentials
- Notification recipient variables
- Optional internal sync/notification secrets

### Firestore indexes

The duplicate-submission/start flow and dashboard/onboarding queries use:

- `onboardingSubmissions`
- `where('userId', '==', uid)`
- `orderBy('updatedAt', 'desc')`

If Firestore requires a composite index in the deployed environment, create the prompted index before release.

### Firestore rules

Confirm the deployed Firestore rules match the hardened server-side behaviour and do not unnecessarily block legitimate client reads/updates required by the onboarding UI.

## Known remaining risks

### Remaining npm audit advisories

Remaining dependency advisories are tracked in `SECURITY_NOTES.md`.

Known categories include:

- OpenTelemetry / Genkit transitive chain
- Firebase Admin / Google Cloud transitive chain
- Next.js bundled PostCSS advisory

These were not force-fixed because the available remediation paths were no-fix, transitive, or unsafe/breaking.

### Manual integration verification still required

The automated tests do not perform real Google Sheets, Google Drive, Firebase Admin, or SMTP network integration tests.

Those must be verified manually or through staging QA.

### Duplicate-submission race edge cases

The server route uses the user profile active submission lock and fallback active submission lookup.

Manual QA should still verify rapid multi-tab/double-click behaviour in the real Firebase environment.

## Rollback plan

If the release causes a critical regression:

1. Revert the latest repair PR merge commit.
2. Redeploy the previous stable version.
3. Preserve affected Firestore submission documents for analysis.
4. Check whether duplicate submissions, Drive folders, or Sheets rows were created during the failed release window.
5. Reapply targeted fixes on a new branch.

Suggested rollback command pattern:

```bash
git switch main
git pull --ff-only origin main
git revert <merge-commit-sha>
git push origin main
```

Use the actual merge commit SHA for the relevant PR.

## Final release checklist

| Item | Status |
|---|---|
| Batch 4B validation anchors merged | Complete |
| Batch 5 dependency remediation merged | Complete |
| Batch 6 integration hardening merged | Complete |
| Batch 7 auth/duplicate-submission hardening merged | Complete |
| Batch 8 docs created | Complete when this document and QA checklist are merged |
| Typecheck passes | Pending final run |
| Tests pass | Pending final run |
| Validation anchor audit passes | Pending final run |
| Production build passes | Pending final run |
| Manual QA checklist completed | Pending |
| Deployment environment variables confirmed | Pending |
| Firestore indexes confirmed | Pending |
| Release approved | Pending |

## Final sign-off

| Role | Name | Date | Sign-off |
|---|---|---|---|
| Technical reviewer |  |  |  |
| QA tester |  |  |  |
| Product/business owner |  |  |  |
