# Security Notes

## Batch 5 dependency/security remediation

This document records vulnerabilities that remain after safe dependency remediation.

### Review date

2026-05-13

### Remediation approach

The following actions were completed:

- Ran baseline `npm audit --audit-level=low`
- Ran baseline `npm outdated`
- Ran non-forced `npm audit fix`
- Updated Next.js from `15.5.15` to `15.5.18`
- Updated PostCSS from `8.5.13` to `8.5.14`
- Updated Firebase from `11.9.1` to `11.10.0`
- Updated Firebase Admin from `13.8.0` to `13.9.0`
- Updated Genkit packages to `1.34.0`
- Updated Nodemailer to `8.0.7`
- Updated `@types/nodemailer` to `8.0.0`
- Updated Vitest to `4.1.6`
- Updated Vite and esbuild through the Vitest/Vite toolchain update

No `npm audit fix --force` was used.

### Audit result summary

Baseline audit:

- 29 vulnerabilities
- 11 low
- 6 moderate
- 12 high

Final audit after remediation:

- 21 vulnerabilities
- 11 low
- 2 moderate
- 8 high

The remaining vulnerabilities are either reported by npm as having no fix available, or would require unsafe/breaking remediation that is not appropriate for this batch.

## Remaining vulnerabilities

### OpenTelemetry / Genkit chain

- Packages: `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`
- Severity: high
- Advisory: Prometheus exporter process crash via malformed HTTP request
- Dependency path: `genkit` / `@genkit-ai/*` / `@genkit-ai/google-cloud`
- Runtime exposure: server-side dependency chain
- Status: npm reports no safe fix available for part of this chain
- Reason not fully fixed in this batch: latest compatible Genkit package updates were applied, but the transitive OpenTelemetry advisory remains
- Follow-up: revisit when Genkit/OpenTelemetry publish patched compatible releases

### Google Cloud / Firebase Admin transitive chain

- Package: `@tootallnate/once`
- Severity: high
- Advisory: incorrect control flow scoping
- Dependency path: Google Cloud / Firebase Admin transitive dependencies through `teeny-request`, `google-gax`, `@google-cloud/firestore`, and related packages
- Runtime exposure: server-side Firebase Admin / Google Cloud dependency chain
- Status: npm reports no fix available
- Reason not fixed in this batch: dependency is transitive and no safe patched parent chain is currently available through compatible package updates
- Follow-up: revisit after Firebase Admin / Google Cloud dependency chain updates are released

### Next.js bundled PostCSS advisory

- Package: `postcss` under `next/node_modules/postcss`
- Severity: moderate
- Advisory: XSS via unescaped `</style>` in CSS stringify output
- Dependency path: bundled through `next`
- Runtime exposure: framework build/runtime dependency
- Status: npm suggests `npm audit fix --force`, but that would install an unsafe/breaking Next.js version according to the audit output
- Reason not fixed in this batch: Next.js was updated to `15.5.18`; npm still reports the advisory through the bundled dependency and suggests an invalid/breaking remediation path
- Follow-up: monitor Next.js patch releases and update again when the advisory is resolved safely

## Verification performed

After remediation, the following checks passed:

- `npm run typecheck`
- `npm test`
- `node scripts/audit-validation-anchors.mjs`

`npm run build` compiled successfully and reached lint/type validation, but failed during page data collection because Firebase public environment variables are missing in Codespace. This is an environment configuration issue, not a dependency remediation failure.
