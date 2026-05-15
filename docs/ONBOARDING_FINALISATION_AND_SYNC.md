# Onboarding finalisation and sync

## Submission state model
- A submission is only treated as final when `onboardingSubmissions/{id}.status == "submitted"`.
- `completionPercentage` is progress-only and must not be treated as submission state.
- Backend `/api/onboarding/finalize` owns final transition to submitted.

## Finalisation writes
Finalisation writes submitted state and immutable snapshot fields, including Drive and Sheets metadata for operations follow-up.

## Google Drive metadata
- `driveWorkspaceStatus`: `created | pending | failed`
- `driveWorkspaceError`
- `driveWorkspaceUpdatedAt`
- `googleDriveFolderId`
- `googleDriveFolderUrl`

Drive errors do not block successful final submission.

## Google Sheets metadata
- `sheetSyncStatus`: `synced | error`
- `sheetSyncedAt`
- `sheetSyncUpdatedAt`
- `sheetSyncError`
- `sheetSummaryAction`
- `sheetAnswerRowsDeleted`
- `sheetAnswerRowsAppended`
- `sheetSyncVersion`

Sheets errors do not block successful final submission.

## Required env vars
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `ONBOARDING_SUBMISSIONS_SPREADSHEET_ID`
- `ONBOARDING_SUBMISSIONS_SHEET_NAME` (optional, default `OnboardingSubmissions`)
- `ONBOARDING_ANSWERS_SHEET_NAME` (optional, default `OnboardingAnswers`)
- `ONBOARDING_SYNC_INTERNAL_SECRET`

## Manual retry endpoint
`POST /api/onboarding-submissions/sync-sheet`

Auth:
- Firebase Bearer token for owner, or
- `x-internal-sync-secret` for internal jobs.

Body:
```json
{ "submissionId": "..." }
```

## Backfill
- `npm run backfill:sheets`
- `npm run backfill:sheets:dry-run`

## Troubleshooting
- If spreadsheet id is missing, sync is skipped and Firestore records `sheetSyncStatus=error` with a reason.
- Re-running sync is idempotent: summary row updated in-place; answer rows deleted then re-appended.
