# Security Notes

## Batch 5 dependency/security remediation

This document records vulnerabilities that remain after safe dependency remediation.

### Review date

2026-05-13

### Remediation approach

The following actions were attempted:

- Non-forced `npm audit fix`
- Safe targeted package updates
- Next.js patch update
- Firebase/Firebase Admin patch update
- Genkit package update
- Nodemailer remediation attempt
- Vitest/Vite/esbuild remediation attempt

No `npm audit fix --force` was used.

## Remaining vulnerabilities

Update this section using the final `npm audit --audit-level=low` output.

For each unresolved item, include:

- Package:
- Severity:
- Advisory:
- Dependency path:
- Runtime or dev-only exposure:
- Reason not fixed in this batch:
- Recommended follow-up:

### Known candidates from baseline audit

#### OpenTelemetry / Genkit chain

- Package: `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`
- Severity: high
- Advisory: Prometheus exporter process crash via malformed HTTP request
- Dependency path: Genkit / @genkit-ai packages
- Status: npm reported no fix available in the baseline audit
- Follow-up: revisit when patched Genkit/OpenTelemetry releases are available

#### @tootallnate/once chain

- Package: `@tootallnate/once`
- Severity: high
- Dependency path: Google Cloud / Firebase Admin transitive dependencies
- Status: npm reported no fix available in the baseline audit
- Follow-up: revisit after Firebase Admin / Google Cloud dependency chain updates

