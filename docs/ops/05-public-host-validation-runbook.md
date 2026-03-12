# Public Host Validation Runbook

Date: March 12, 2026

## Goal

Provide a human-executable validation flow for the final hosted origin before public store submission.

## Preconditions

- final production domain chosen
- final DNS already propagated
- TLS certificate already issued
- reviewer environment enabled on the hosted origin
- support and privacy contacts finalized

## Execution steps

| Step | Action | Expected evidence | Severity if fails | Owner | Blocks production? |
| --- | --- | --- | --- | --- | --- |
| 1 | Open root host in mobile browser | Screenshot of final domain loading | Critical | Infra / ops | Yes |
| 2 | Open `/api/mobile/runtime` | JSON response with `200` | Critical | Infra / ops | Yes |
| 3 | Open `/api/health` | JSON response with `200` | Critical | Infra / ops | Yes |
| 4 | Open `/review-access` | Screenshot of reviewer page | High | Ops | Yes |
| 5 | Open `/politica-privacidade` | Screenshot of privacy page | High | Legal / ops | Yes |
| 6 | Open `/termos-de-uso` | Screenshot of terms page | Medium | Legal / ops | Yes |
| 7 | Open `/excluir-conta` | Screenshot of deletion page | High | Legal / ops | Yes |
| 8 | Login with reviewer account | Screenshot/video of dashboard | Critical | QA / ops | Yes |
| 9 | Reload protected page | Session remains valid | High | QA | Yes |
| 10 | Logout | Redirect to login or unauthenticated state | High | QA | Yes |
| 11 | Attempt protected route logged out | Access denied or redirected to login | High | QA | Yes |
| 12 | Disable network after shell open | Friendly runtime error or recoverable state | Medium | QA | No, but strongly recommended |

## Evidence retention

- store all screenshots/videos in the release record
- record date, tester, network used, and device used
- record exact final host name

## Go / no-go rule

Any failure in steps 1 to 11 is a no-go for public store production.
