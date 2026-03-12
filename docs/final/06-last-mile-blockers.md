# Last Mile Blockers

Date: March 12, 2026

## Unique remaining blocker set

1. Verify the hosted app URL used by `mobile-build/mobile-shell.json` from a real external network.
2. Deploy the reviewer environment with:
   - `NEXT_PUBLIC_USE_MOCK=true`
   - `NEXT_PUBLIC_APP_URL=https://<review-host>`
3. Validate the provisioned reviewer account in that hosted environment.
4. Fill legal entity, support, and privacy owner fields.
5. Submit Apple privacy answers and Google Data Safety answers in the consoles.
6. Complete iOS signing and Android signing.

## Recommended closure order

1. Hosted review environment smoke test
2. Legal/business field completion
3. Console privacy form completion
4. Signed native archive generation
5. TestFlight / Play internal upload
6. Final production go/no-go review
