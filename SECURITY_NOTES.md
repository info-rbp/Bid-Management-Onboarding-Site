# Security Notes

## Current posture

This document tracks security work that still needs runtime verification after the repository hardening pass completed on 2026-05-26.

## Confirmed changes now in the repository

- Firestore rules restrict client updates on `onboardingSubmissions` to an explicit allowlist of in-progress fields
- Submission creation, submission finalization, Sheets sync metadata, Drive metadata, and immutable submission snapshot fields are server-managed
- Critical operational routes now use shared request validation, Firebase token enforcement, internal secret enforcement, and request rate limiting
- Final submission is validated server-side before a submission can be marked `submitted`
- Placeholder secret files were removed from the repository
- Unused Genkit/Google AI tooling was removed from the application manifest to reduce unnecessary dependency and attack surface

## Follow-up validation still required

Run these commands in a real installable checkout before release:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

## Known remaining risk areas

### Transitive dependency advisories

- Firebase Admin / Google Cloud transitive dependencies may still produce `npm audit` findings
- Next.js bundled dependency advisories may remain until upstream framework releases absorb fixes

Because the dependency graph changed after the post-audit cleanup, any previous vulnerability totals should be treated as stale until `npm audit` is run again.

### Environment-dependent runtime validation

The repository still requires live environment verification for:

- Firebase App Hosting configuration
- Firebase Admin credentials
- Firestore rules deployment
- Storage rules deployment
- Google Drive and Google Sheets credentials
- SMTP credentials and notification delivery

## Release recommendation

Do not treat this file as proof that the runtime environment is secure by itself. Use it as a checklist for the final install, audit, build, and staging verification pass.
