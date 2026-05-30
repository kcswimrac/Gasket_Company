# Zero Trust & SOC 2 Compliance Tracker

## Status Key
- [ ] Not started
- [~] In progress
- [x] Complete

## Critical

- [x] C1 — Session timeout + logout button (30-min idle, explicit logout, server revocation)
- [x] C2 — Rate limiting on public endpoints (/api/contribute, /api/bounties, /api/checkout, /api/materials)
- [ ] C3 — Per-user admin accounts (replace shared password with individual logins, JWT sessions)
- [ ] C4 — Role-based access control (owner/operator/viewer roles per admin route)
- [x] C5 — Input validation + XSS sanitization on public routes
- [x] C6 — Content Security Policy + security headers

## High

- [x] H1 — Audit logging for admin mutations (who changed what, when)
- [x] H2 — File upload validation (type allowlist, size limits)
- [ ] H3 — Data retention policy + customer deletion API
- [ ] H4 — File upload malware scanning (VirusTotal or similar — needs API key)

## Medium

- [x] M1 — Error monitoring setup (structured logging)
- [x] M2 — Privacy policy page
- [x] M3 — Verify secrets management (.gitignore, no hardcoded tokens)
- [ ] M4 — Automated tests + CI pipeline (Jest/Vitest + GitHub Actions)
- [ ] M5 — HSTS + HTTPS enforcement headers

## Notes

- C3/C4 require architecture decision: Auth.js vs Clerk vs custom JWT. Needs user input.
- H3 requires policy decision: retention period, what constitutes "deletion". Needs user input.
- H4 requires VirusTotal API key or similar service. Needs user input.
- M4 is a large effort — best done as a dedicated sprint.
