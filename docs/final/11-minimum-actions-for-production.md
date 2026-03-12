# Minimum Actions For Production

Date: March 12, 2026

## Smallest possible action list

1. Set and externally validate the final hosted domain used by the mobile shell.
2. Set `SUPPORT_EMAIL` and `PRIVACY_EMAIL`.
3. Confirm `/review-access`, `/politica-privacidade`, `/termos-de-uso`, and `/excluir-conta` on the deployed host.
4. Validate reviewer login, logout, and protected navigation on the deployed host.
5. Fill legal entity, publisher, and contact fields for Apple and Google.
6. Submit Apple privacy answers and Google Data Safety answers with those final values.
7. Generate signed native builds and upload to the stores.

## Final closure order

1. Infra host validation
2. Support/privacy contact setup
3. Legal entity completion
4. Reviewer flow validation on hosted environment
5. Store console completion
6. Signed upload
