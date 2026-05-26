# Phase 1: Foundation & Navigation Remediation Checklist

This checklist covers the manual test cases required to verify the core infrastructure of the Bid Manager onboarding portal in its current architecture.

## 1. Dynamic Step Numbering
- [ ] **Sidebar Sequence**: Verify that sidebar numbers are continuous (1, 2, 3...) with no gaps.
- [ ] **Conditional Insertion**: Go to Step 3 (Service Selection) and change service selections. Verify the visible onboarding path remains coherent and section ordering is preserved.
- [ ] **Dynamic Titles**: Verify that page headers display the correct number based on current visibility instead of hardcoded values.
- [ ] **Clean Configuration**: Check `src/lib/onboarding-steps.ts` to ensure no `title` or `shortTitle` contains hardcoded numeric prefixes.

## 2. Authentication & Route Guards
- [ ] **Unauthenticated Access (Dashboard)**: Attempt to visit `/dashboard` while signed out. Should redirect to `/auth`.
- [ ] **Unauthenticated Access (Wizard)**: Attempt to visit `/onboarding/welcome_expectations` while signed out. Should redirect to `/auth`.
- [ ] **Authenticated Access**: Sign in with a valid client account and verify access to `/dashboard`.
- [ ] **Submission Lock**: Set an onboarding document's status to `submitted`. Verify that steps show a read-only state and inputs are disabled.

## 3. Onboarding Entry Logic
- [ ] **Logged-out Flow**: Click "Start Your Onboarding" on the homepage while logged out. Verify redirect to `/auth`.
- [ ] **First-time Creation**: Click the CTA as an authenticated user with no existing submission. Verify a new Firestore document is created and the user is routed to `welcome_expectations`.
- [ ] **Resume Flow**: Click the CTA as a returning user with progress. Verify redirect to the saved `currentStep`.
- [ ] **Post-Submission**: Click the CTA after submitting. Verify redirect to the dashboard with the "View Submitted Pack" state.

## 4. Save and Return (Persistence)
- [ ] **Navigation Sync**: Navigate to a specific step and confirm `currentStep` updates in Firestore.
- [ ] **Dashboard Resume**: From the dashboard, click "Continue Onboarding". Verify it opens the exact step that was last active.
- [ ] **Explicit Completion**: Click "Next Step" on a valid section. Verify that `sectionStatuses.{step}.status` becomes `complete`.
- [ ] **Sidebar Continuity**: Click a step in the sidebar. Verify the current section data is saved as a draft and the user is navigated to the target step.

## 5. Validation & Section Status
- [ ] **Field Blocking**: Leave a required field empty and click "Next Step". Verify navigation is blocked and a validation message appears.
- [ ] **Visual Indicators**: After a failed validation, verify the sidebar and dashboard tile for that section show an attention state.
- [ ] **Submission Guard**: On the final submission page, verify the "Complete Onboarding" button is disabled if any required visible section is not complete.
- [ ] **Server Submission Guard**: Attempt to finalize via a crafted API request with incomplete required sections. Verify the API rejects the submission.

## 6. Autosave & Debounce
- [ ] **Debounce Write**: Type into a text field in any onboarding step. Wait ~1.5 seconds. Verify the save status updates and data is written to Firestore.
- [ ] **Draft Recovery**: Enter data into a step, refresh the browser. Verify the data reloads correctly from Firestore.
- [ ] **Non-Interference**: Verify that an autosave trigger never marks a section as `complete` or navigates the user away.
- [ ] **Lock Enforcement**: Verify that for a `submitted` pack, autosave is disabled.
