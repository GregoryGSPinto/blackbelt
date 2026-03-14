# Store Readiness Scorecard

Date: 2026-03-14

| Domain | Status | Notes |
|---|---|---|
| Build validation | Resolvido tecnicamente | `pnpm typecheck`, `pnpm lint`, `pnpm test`, `npx next build --webpack` |
| Mobile packaging | Resolvido tecnicamente | Hosted shell + `mobile-build/` are the active path |
| Hosted mobile runtime | Depende de configuração externa | Needs final host evidence |
| App Review readiness | Depende de configuração externa | Needs reviewer credentials and hosted proof |
| Billing structure | Resolvido tecnicamente | Live Stripe execution still needs envs |
| Compliance / legal submission | Depende de configuração externa | Business identity fields still external |
| Broad store production | Planejado | Not an honest current label |

## Unique Remaining Blockers

- final hosted mobile origin still needs external validation
- reviewer path still needs real credentials
- business/legal identity still needs console completion
- live Stripe setup still needs secrets and price mappings

## Honest Outcome Labels

- Beta privado: `Estável em piloto`
- Cliente piloto pago: `Estável em piloto`
- Produção web controlada: `GO com suporte operacional`
- Google Play internal testing: `Depende de configuração externa`
- App Store TestFlight: `Depende de configuração externa`
- Google Play production: `Planejado`
- App Store production: `Planejado`
