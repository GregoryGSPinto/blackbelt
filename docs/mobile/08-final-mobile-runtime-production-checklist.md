# Final Mobile Runtime Production Checklist

Date: March 12, 2026

## Human checklist

| Item | Expected evidence | Severity if fails | Who executes | Blocks public production? | Decision per item |
| --- | --- | --- | --- | --- | --- |
| `pnpm mobile:runtime:check` passes locally | CLI output saved | Medium | Engineering | No | Pass before external run |
| `NEXT_PUBLIC_APP_URL` points to final host | `.env` / release config evidence | Critical | Infra | Yes | Must pass |
| Host is not preview/tunnel/local | Browser and config evidence | Critical | Infra | Yes | Must pass |
| `/api/mobile/runtime` returns `200` | JSON screenshot | Critical | Infra / ops | Yes | Must pass |
| `/api/health` returns `200` | JSON screenshot | Critical | Infra / ops | Yes | Must pass |
| `/review-access` loads | Page screenshot | High | Ops | Yes | Must pass |
| Legal public pages load | Page screenshots | High | Ops / legal | Yes | Must pass |
| Reviewer login succeeds | Dashboard screenshot | Critical | QA / ops | Yes | Must pass |
| Session persists after reload | Reload screenshot | High | QA | Yes | Must pass |
| Logout succeeds | Redirect/unauthenticated screenshot | High | QA | Yes | Must pass |
| Support and privacy contacts are final | Docs/config evidence | High | Founder / legal | Yes | Must pass |

## Final runtime decision

- TestFlight controlled: READY
- Google Play internal testing: READY
- Public store production runtime: NOT READY until the checklist above is externally executed and evidenced
