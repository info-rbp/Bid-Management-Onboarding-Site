# QA Onboarding Regression Checklist

## Purpose

This checklist verifies the repaired Bid Management onboarding flow after the onboarding application repair programme.

It focuses on the areas that previously caused save loops, hidden validation failures, duplicate onboarding submissions, unsafe finalisation behaviour, integration retry issues, and notification/auth hardening gaps.

## Scope

This QA checklist covers:

- Authentication and protected-route access
- Onboarding start/resume flow
- Duplicate-submission prevention
- Section validation and validation anchors
- Section 12 Service Modules regression testing
- Draft save and navigation behaviour
- Final submission flow
- Google Drive folder creation/retry behaviour
- Google Sheets sync/retry behaviour
- Notification hardening
- AuthGuard profile repair handling
- Dashboard continuation behaviour
- Regression build/test verification

## Environment details

Complete this section before testing.

| Field | Value |
|---|---|
| Environment | Local / Staging / Production |
| Tester |  |
| Date |  |
| Branch / Commit SHA |  |
| Firebase project |  |
| Google Drive parent folder configured | Yes / No |
| Google Sheets target configured | Yes / No |
| Notification SMTP configured | Yes / No |
| Browser | Chrome / Safari / Edge / Firefox |
| Device | Desktop / Tablet / Mobile |

## Required environment variables

Confirm these are configured in the environment being tested.

### Firebase public variables

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin / server variables

- Firebase Admin credentials used by `src/lib/firebase-admin.ts`
- Any configured Firebase service account or app hosting credentials

### Google Workspace / notifications

- `GOOGLE_WORKSPACE_AUTH_EMAIL`
- `GOOGLE_WORKSPACE_FROM_EMAIL`
- `GOOGLE_WORKSPACE_FROM_NAME`
- `GOOGLE_WORKSPACE_APP_PASSWORD`
- `ONBOARDING_SUBMISSION_NOTIFICATION_TO`
- `SIGNUP_NOTIFICATION_TO`

### Google Drive / Sheets

- `GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID`
- Google Sheets spreadsheet ID/configuration used by onboarding submissions sync

### Optional internal secrets

- `ONBOARDING_SYNC_INTERNAL_SECRET`
- `ONBOARDING_NOTIFICATION_INTERNAL_SECRET`

## Pre-QA verification commands

Run these before manual QA.

```bash
npm install
npm run typecheck
npm test
node scripts/audit-validation-anchors.mjs
npm run build
```

Expected results:

| Check | Expected result |
|---|---|
| `npm run typecheck` | Passes |
| `npm test` | Passes |
| `node scripts/audit-validation-anchors.mjs` | `Validation keys found: 121`, `Anchors found: 121`, `Allowlisted composite anchors: 0` |
| `npm run build` | Full production build passes |

## Static safety checks

Run these grep checks before manual QA.

```bash
grep -R "addDoc(collection(db, 'onboardingSubmissions')" -n src || true
grep -R "setDoc(doc(db, 'onboardingSubmissions'" -n src/app src/components || true
grep -R "api/onboarding-submissions/start" -n src || true
grep -R "/api/notifications/submission" -n src || true
grep -R "appendOnboardingSubmissionToSheet" -n src/app scripts || true
```

Expected results:

| Check | Expected result |
|---|---|
| Client-side `addDoc` onboarding creation | No results |
| Client-side `setDoc` onboarding creation | No results |
| `/api/onboarding-submissions/start` | Present in dashboard, onboarding page, and start button |
| `/api/notifications/submission` | No results |
| `appendOnboardingSubmissionToSheet` in app/scripts | No route/backfill usage of append-only behaviour |

## Test accounts

Use at least these test account states.

| Account type | Purpose |
|---|---|
| New user with no profile doc | AuthGuard profile repair and onboarding start |
| Existing user with no onboarding submission | Start route creates one submission |
| Existing user with active onboarding submission | Start route resumes existing submission |
| Existing user with submitted onboarding submission | Locked/read-only behaviour |
| Existing user with incomplete Section 12A | Validation and save behaviour |
| Existing user with reopened/adminReopened submission | Edit-after-reopen behaviour if supported |

---

# Manual QA checklist

## 1. Authentication and AuthGuard

### 1.1 Unauthenticated route protection

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Log out completely | User is logged out |  |  |
| Visit `/dashboard` | Redirects to `/auth?returnUrl=/dashboard` |  |  |
| Visit `/onboarding/welcome_expectations` | Redirects to auth with safe return URL |  |  |
| Log in successfully | Redirects to the requested internal return URL |  |  |

### 1.2 Safe return URL handling

Manually test auth URLs.

| URL | Expected result | Pass/Fail |
|---|---|---|
| `/auth?returnUrl=/dashboard` | Redirects to dashboard after login |  |
| `/auth?returnUrl=/onboarding/welcome_expectations` | Redirects to onboarding step after login |  |
| `/auth?returnUrl=https://example.com` | Falls back to dashboard |  |
| `/auth?returnUrl=//example.com` | Falls back to dashboard |  |
| `/auth?returnUrl=javascript:alert(1)` | Falls back to dashboard |  |

### 1.3 AuthGuard profile repair

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Use a user with missing `users/{uid}` profile document | AuthGuard attempts profile repair |  |  |
| Confirm profile is created | Profile exists in Firestore |  |  |
| Temporarily block profile repair/write permissions in test environment | AuthGuard displays visible profile repair error UI |  |  |
| Click Retry profile repair | Repair is attempted again |  |  |
| Click Sign out | User signs out and returns to auth |  |  |
| Confirm protected content does not render while repair has failed | Protected page remains blocked by error UI |  |  |

---

## 2. Onboarding start/resume and duplicate-submission prevention

### 2.1 New user starts onboarding from homepage

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Log in as a user with no active onboarding submission | User reaches dashboard/home |  |  |
| Click Start Onboarding once | App calls `/api/onboarding-submissions/start` |  |  |
| Confirm Firestore `onboardingSubmissions` | Exactly one active submission created |  |  |
| Confirm `users/{uid}.activeOnboardingSubmissionId` | Set to the created submission ID |  |  |
| Confirm route | User lands on `/onboarding/welcome_expectations` or returned route |  |  |

### 2.2 Double-click start button

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Use a user with no active submission | Starting state is clean |  |  |
| Rapidly double-click Start Onboarding | Only one active submission is created |  |  |
| Refresh Firestore | No duplicate active submissions |  |  |
| Confirm user profile lock | `activeOnboardingSubmissionId` points to the active submission |  |  |

### 2.3 Multi-tab start/resume

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open two tabs for the same logged-in user | Both sessions are active |  |  |
| Start onboarding in both tabs quickly | Both resolve to the same active submission |  |  |
| Confirm Firestore count | No duplicate active submissions created |  |  |
| Refresh both tabs | Both resume same submission/current step |  |  |

### 2.4 Dashboard start/continue

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Visit `/dashboard` with no submission | Start Onboarding button shown |  |  |
| Click Start Onboarding | Calls start route and routes to returned onboarding route |  |  |
| Return to dashboard | Continue Onboarding shown |  |  |
| Click Continue Onboarding | Routes to current visible step |  |  |
| Refresh dashboard | Latest active submission is selected deterministically |  |  |

---

## 3. Draft save and navigation

### 3.1 Basic autosave

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open `/onboarding/welcome_expectations` | Page loads existing or new submission |  |  |
| Change a field | Save status shows saving |  |  |
| Wait for autosave delay | Save status shows saved |  |  |
| Refresh page | Field value persists |  |  |

### 3.2 Save Draft button

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Edit a section | Unsaved form data exists |  |  |
| Click Save Draft | Draft is saved |  |  |
| Confirm Firestore section data | Updated section data exists |  |  |
| Confirm current step remains stable | User stays on same section |  |  |

### 3.3 Previous/Next navigation

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Complete a valid section | Next Step saves and moves forward |  |  |
| Click Previous | Saves current data and moves back |  |  |
| Refresh after navigation | Current step and form data are stable |  |  |

---

## 4. Validation anchors and inline errors

### 4.1 Validation summary appears

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Open a required section | Leave required fields empty |  |  |
| Click Next Step | Validation summary appears |  |  |
| Confirm section status | Section status becomes needs_attention or equivalent blocked/incomplete state |  |  |
| Confirm no permanent saving spinner | Save status exits saving state |  |  |

### 4.2 Click-to-scroll behaviour

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Click a validation summary item | Page scrolls to the related field/group |  |  |
| Field receives focus where practical | Focus lands on the input or nearest wrapper |  |  |
| Fix the field | Error disappears after validation/save |  |  |

### 4.3 Anchor audit

| Step | Expected result | Pass/Fail |
|---|---|---|
| Run `node scripts/audit-validation-anchors.mjs` | 121 keys found and 121 anchors found |  |

---

## 5. Section 12 Service Modules regression

This is the original high-priority bug area.

### 5.1 Section 12A Tender/Supplier Readiness validation

Test these fields specifically:

- `tenderSupplierReadiness.realisticContractSizes`
- `tenderSupplierReadiness.preparedForComplianceRequirements`
- `tenderSupplierReadiness.previousMaterialsAvailable`
- `tenderSupplierReadiness.submissionApprover`
- `tenderSupplierReadiness.contractTermsApprover`

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Select services that enable relevant service modules | Section 12 appears |  |  |
| Open Section 12 Service Modules | Section loads normally |  |  |
| Leave 12A required fields incomplete | Clicking Next Step shows validation errors |  |  |
| Click each validation summary item | Scrolls to correct 12A field/group |  |  |
| Complete all required 12A fields | Validation clears |  |  |
| Click Save Draft | Save completes and does not hang |  |  |
| Click Next Step | User progresses to next visible section |  |  |
| Refresh page | 12A values persist |  |  |

### 5.2 Service module visibility

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Change service selection to include tender readiness | Tender readiness module becomes active |  |  |
| Change service selection to include grants | Grants module becomes active |  |  |
| Change service selection to include marketplace strategy | Marketplace module becomes active |  |  |
| Remove a service | Related module/step is hidden or skipped correctly |  |  |
| Confirm hidden section redirect | Hidden section redirects to first valid visible step |  |  |

---

## 6. Final submission flow

### 6.1 Incomplete submission is blocked

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Leave one required section incomplete | Final submission page lists blocker |  |  |
| Attempt submit | Submission is blocked |  |  |
| Complete missing section | Blocker clears |  |  |

### 6.2 Successful final submission

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Complete all required sections | Final page shows ready state |  |  |
| Submit onboarding pack | `/api/onboarding/finalize` called with Firebase bearer token |  |  |
| Confirm no `userId` is sent in body | Request body excludes client-supplied `userId` |  |  |
| Confirm Firestore submission | Status becomes submitted |  |  |
| Confirm submittedAt | Timestamp set |  |  |
| Confirm route | User redirected to `/onboarding/submitted?id=<submissionId>` |  |  |
| Reopen submitted onboarding page | Submission is read-only unless adminReopened |  |  |

---

## 7. Google Drive integration

### 7.1 Folder creation

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Submit onboarding pack | Google Drive folder is created or reused |  |  |
| Confirm folder name | `Onboarding - <Business Name> - <submissionId>` |  |  |
| Confirm folder metadata | `googleDriveFolderId` and `googleDriveFolderUrl` stored |  |  |
| Confirm parent folder | Uses configured `GOOGLE_DRIVE_ONBOARDING_PARENT_FOLDER_ID` if set |  |  |

### 7.2 Retry idempotency

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Retry finalisation for same submission | Existing folder is reused |  |  |
| Confirm Drive | No duplicate folder created |  |  |
| Confirm Firestore | Same folder ID remains stored |  |  |

---

## 8. Google Sheets sync

### 8.1 User-triggered sync security

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Call sync route without token | Request rejected |  |  |
| Call sync route with wrong user token | Request rejected |  |  |
| Call sync route with owner token | Sync succeeds |  |  |

### 8.2 Summary row idempotency

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Sync a submission once | Summary row is created |  |  |
| Sync same submission again | Summary row is updated, not duplicated |  |  |
| Confirm `Submission ID` column | Only one summary row for submission ID |  |  |

### 8.3 Answer row idempotency

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Sync a submission once | Answer rows created |  |  |
| Change section answers | Sync same submission again |  |  |
| Confirm answers sheet | Old rows for same submission ID replaced/regenerated |  |  |
| Confirm no duplicate answer set | No duplicate answer rows remain for same field keys |  |  |

### 8.4 Backfill retry safety

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Run backfill once | Rows created/updated |  |  |
| Run backfill again | No duplicate summary rows |  |  |
| Confirm answer rows | Existing answer rows replaced before append |  |  |
| Confirm counts | Script reports created/updated/deleted/appended counts |  |  |

---

## 9. Notification hardening

### 9.1 Onboarding submitted notification

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Submit onboarding pack | Notification sent server-side from finalisation route |  |  |
| Confirm notification data | Uses server-fetched submission/user data |  |  |
| Simulate email failure | Finalisation still succeeds and error is logged |  |  |

### 9.2 Notification abuse prevention

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| POST to onboarding submitted notification route without internal secret | Rejected or 405 |  |  |
| POST arbitrary body data to notification route | Does not send arbitrary email |  |  |
| POST signup notification without token/secret | Rejected |  |  |
| Signup notification with valid Firebase token | Sends from server-fetched profile data |  |  |

---

## 10. Dashboard regression

| Step | Expected result | Pass/Fail | Notes |
|---|---|---|---|
| Dashboard loads for user with no submission | Shows Not Started / Start button |  |  |
| Dashboard loads for user with in-progress submission | Shows progress and Continue button |  |  |
| Dashboard loads for submitted user | Shows submitted/read-only pack state |  |  |
| Dashboard step cards | Correct current/completed/needs-attention statuses |  |  |
| Dashboard Start button double-click | Does not create duplicates |  |  |

---

## 11. Browser/device smoke tests

Run a shortened full-flow test on each target browser/device.

| Browser/device | Pass/Fail | Notes |
|---|---|---|
| Chrome desktop |  |  |
| Safari desktop |  |  |
| Edge desktop |  |  |
| Mobile viewport |  |  |

---

# Final QA sign-off

| Area | Pass/Fail | Notes |
|---|---|---|
| Auth and AuthGuard |  |  |
| Start/resume duplicate prevention |  |  |
| Dashboard |  |  |
| Draft save |  |  |
| Validation summary/anchors |  |  |
| Section 12A Service Modules |  |  |
| Final submission |  |  |
| Google Drive |  |  |
| Google Sheets |  |  |
| Notifications |  |  |
| Build/test/audit commands |  |  |

## Release decision

- [ ] Ready to release
- [ ] Ready with known non-blocking issues
- [ ] Not ready

## Known issues before release

| Issue | Severity | Owner | Follow-up |
|---|---|---|---|
|  |  |  |  |

## Tester sign-off

| Name | Role | Date | Sign-off |
|---|---|---|---|
|  |  |  |  |
