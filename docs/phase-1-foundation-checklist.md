# Phase 1: Foundation & Navigation Remediation Checklist

This checklist covers the manual test cases required to verify the core infrastructure of the Bid Manager onboarding portal.

## 1. Dynamic Step Numbering
- [ ] **Sidebar Sequence**: Verify that sidebar numbers are continuous (1, 2, 3...) with no gaps.
- [ ] **Conditional Insertion**: Go to Step 4 (Service Selection) and select "Grants". Verify that the "Grants" section appears in the sidebar and dashboard, and that all subsequent step numbers (e.g., Workflow Rules) increment correctly.
- [ ] **Dynamic Titles**: Verify that page headers display the correct number based on current visibility (e.g., `1. Welcome & Expectations`) instead of hardcoded values.
- [ ] **Clean Configuration**: Check `src/lib/onboarding-steps.ts` to ensure no `title` or `shortTitle` contains hardcoded numeric prefixes like "18.".

## 2. Authentication & Route Guards
- [ ] **Unauthenticated Access (Dashboard)**: Attempt to visit `/dashboard` while signed out. Should redirect to `/auth`.
- [ ] **Unauthenticated Access (Wizard)**: Attempt to visit `/onboarding/welcome_expectations` while signed out. Should redirect to `/auth`.
- [ ] **Unpaid Access**: Sign in with an account that has `subscriptionStatus: "inactive"`. Attempt to visit `/dashboard`. Should redirect to `/payment`.
- [ ] **Paid Access**: Change a user's `subscriptionStatus` to `active` in Firestore. Verify they can now access `/dashboard` and onboarding steps.
- [ ] **Submission Lock**: Set an onboarding document's status to `submitted`. Verify that steps show a "Read-Only" banner and inputs are disabled.

## 3. Onboarding Entry Logic (Start Onboarding Button)
- [ ] **Logged-out Flow**: Click "Start Your Onboarding" on the homepage while logged out. Verify redirect to `/auth`.
- [ ] **Unpaid Flow**: Click the CTA while logged in but inactive. Verify redirect to `/payment`.
- [ ] **First-time Creation**: Click the CTA as a paid user with no existing submission. Verify a new Firestore document is created and the user is routed to `welcome_expectations`.
- [ ] **Resume Flow**: Click the CTA as a returning user with progress. Verify redirect to the dashboard or the saved `currentStep`.
- [ ] **Post-Submission**: Click the CTA after submitting. Verify redirect to dashboard with the "View Submitted Pack" state.

## 4. Save and Return (Persistence)
- [ ] **Navigation Sync**: Navigate to a specific step (e.g., "Business Snapshot"). Check Firestore to ensure `currentStep` is updated to `business_snapshot`.
- [ ] **Dashboard Resume**: From the dashboard, click "Continue Onboarding". Verify it opens the exact step that was last active.
- [ ] **Explicit Completion**: Click "Next Step" on a valid section. Verify that the step key is added to `completedSteps` in Firestore.
- [ ] **Sidebar Continuity**: Click a step in the sidebar. Verify the current section data is saved as a draft and the user is navigated to the target step.

## 5. Validation & Section Status
- [ ] **Field Blocking**: Leave a required field (e.g., "Business Mission" in Business Profile) empty and click "Next Step". Verify navigation is blocked and a validation toast appears.
- [ ] **Visual Indicators**: After a failed validation, verify the Sidebar and Dashboard tile for that section show an "Attention" (warning) icon.
- [ ] **Submission Guard**: On the final submission page, verify the "Submit" button is disabled if any required visible section is not `complete`.
- [ ] **Conditional Logic**: Verify that hidden modules (those not selected in Step 4) do not block final submission.

## 6. Autosave & Debounce
- [ ] **Debounce Write**: Type into a text field in any onboarding step. Wait ~1.5 seconds. Verify the "Saved" status appears in the header and data is updated in Firestore.
- [ ] **Draft Recovery**: Enter data into a step, refresh the browser. Verify the data is reloaded correctly from Firestore.
- [ ] **Non-Interference**: Verify that an autosave trigger *never* marks a section as `complete` or navigates the user away.
- [ ] **Lock Enforcement**: Verify that for a `submitted` pack, the autosave functionality is completely disabled.
