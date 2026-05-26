# Bid Manager Onboarding Portal

## Product Objective

Bid Manager Onboarding Portal is a secure intake workflow for new bid-management clients. It collects the business, delivery, compliance, workflow, authority and document information needed for Remote Business Partner to begin servicing a client.

## Confirmed Core Features

- Firebase email/password authentication for client users
- Guided multi-step onboarding with progress tracking and draft save/resume
- Conditional service module configuration from service selections
- Document upload library backed by Firebase Storage
- Final submission workflow with required acknowledgements
- Google Drive folder creation or reuse on submission
- Google Sheets synchronization for operational reporting
- Internal email notifications for signup and completed onboarding

## Confirmed Non-Features

- No Stripe payment flow is currently implemented
- No subscription gating is currently enforced
- No in-app admin review console is currently implemented
- No AI or Genkit workflow is required by the live application

## Experience Guidelines

- Keep the application focused on authenticated client onboarding, not marketing
- Preserve the lightweight dashboard-plus-wizard flow
- Prefer clear progress, validation, and read-only submission lock states
- Keep operational integrations server-owned rather than client-trusted
