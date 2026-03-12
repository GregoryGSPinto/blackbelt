# External Host Production Gate

Date: March 12, 2026

## Final definition of host READY

The final hosted origin is `READY` for public store production only when every item below has external evidence collected from a real network outside the development workspace.

| Item | Expected evidence | Severity if fails | Who executes | Blocks public production? | Final decision rule |
| --- | --- | --- | --- | --- | --- |
| Professional domain | Browser address bar and screenshot proving final domain, not preview/tunnel | Critical | Infra / founder | Yes | Must pass |
| HTTPS valid | Browser lock icon or certificate inspector screenshot | Critical | Infra / founder | Yes | Must pass |
| `GET /api/mobile/runtime = 200` | Curl/browser response capture | Critical | Infra / ops | Yes | Must pass |
| `GET /api/health = 200` | Curl/browser response capture | Critical | Infra / ops | Yes | Must pass |
| Redirect chain stable | Final URL list with no temporary hosts | High | Infra / ops | Yes | Must pass |
| `/review-access` accessible | Screenshot of loaded page | High | Ops | Yes | Must pass |
| `/politica-privacidade` accessible | Screenshot of loaded page | High | Ops / legal | Yes | Must pass |
| `/termos-de-uso` accessible | Screenshot of loaded page | Medium | Ops / legal | Yes | Must pass |
| `/excluir-conta` accessible | Screenshot of loaded page | High | Ops / legal | Yes | Must pass |
| Reviewer login works | Video or screenshots of login success | Critical | Ops / QA | Yes | Must pass |
| Session persists | Reload after login keeps session | High | QA | Yes | Must pass |
| Logout works | Evidence of logout and protected route denial | High | QA | Yes | Must pass |
| Support contact defined | Support email/URL visible and valid | High | Founder / ops | Yes | Must pass |
| Privacy contact defined | Privacy email/DPO contact visible and valid | High | Founder / legal | Yes | Must pass |

## Residual host blockers

- external validation has not yet been executed
- `SUPPORT_EMAIL` is still not finalized
- `PRIVACY_EMAIL` is still not finalized
- no approved fallback host is configured

## Decision

- host ready for App Store production: NOT READY
- host ready for Google Play production: NOT READY

The host becomes `READY` only after the table above is fully evidenced and signed off operationally.
