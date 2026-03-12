# BlackBelt System Map

Data da auditoria: 12 de março de 2026

## Stack real

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind, `next-intl`
- Backend in-app: rotas `app/api/*` servindo BFF e integrações
- Backend auxiliar: pasta `server/` com experimentos de domain engine/event store
- Mobile wrapper: Capacitor 8 com projetos nativos em `ios/` e `android/`
- Auth: Supabase Auth via SSR (`@supabase/ssr`) + cookies de sessão
- Billing: Stripe no código (`app/api/webhooks/stripe`, serviços de assinatura/trial)
- Analytics/observabilidade: Sentry, OpenTelemetry, Vercel Analytics/Speed Insights
- Storage/dados: Supabase Postgres + Storage tipado
- Notificações: push via Capacitor Push Notifications + tabela `push_tokens`
- E-mail: Resend
- Outras integrações: YouTube thumbnails, deep links, biometria nativa, QR check-in

## Estrutura operacional

- Web app: `app/`, `components/`, `lib/`, `src/`
- Banco e funções edge: `supabase/migrations`, `supabase/functions`
- Native: `ios/App`, `android/app`
- Scripts: `scripts/`
- Artefatos de loja: `store/screenshots`, `docs/STORE_METADATA.md`

## Comandos reais observados

- Instalação: `pnpm install`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Testes: `pnpm test`
- Build web: `pnpm build`
- Build mobile unificado: `pnpm build:mobile`
- Sync mobile: `pnpm mobile:sync:ios`, `pnpm mobile:sync:android`

## Pipeline mobile atual

- Fonte única de web assets configurada em `capacitor.config.ts`: `out/`
- Geração esperada: `CAPACITOR_BUILD=true next build --webpack`
- Sync esperado: `npx cap sync ios` e `npx cap sync android`
- Estado atual:
  - configuração unificada corrigida para `out/`
  - export estático ainda falha em prerender para múltiplas rotas
  - `cap sync` depende desse build e não conclui enquanto `out/` não existir

## iOS

- Projeto: `ios/App/App.xcodeproj`
- Bundle base: `com.blackbelt.app`
- Privacy manifest presente: `ios/App/App/PrivacyInfo.xcprivacy`
- Permissões declaradas após correção:
  - Face ID
  - Câmera
  - Photo Library
  - Remote notifications

## Android

- Projeto: `android/app`
- Application ID: `com.blackbelt.app`
- Versão atual: `versionCode 1`, `versionName 1.0.0`
- Permissões presentes após hardening:
  - `INTERNET`
  - `USE_BIOMETRIC`
  - `USE_FINGERPRINT`
  - `POST_NOTIFICATIONS`
  - `VIBRATE`
- Permissão removida: `RECEIVE_BOOT_COMPLETED`

## Release pipeline observada

- Não há pipeline CI/CD de release claramente consolidada no repositório
- Há scripts legados concorrentes: `scripts/build-capacitor.sh`, `scripts/build-native.sh`, `scripts/capacitor-setup.sh`
- A automação ainda depende de operador humano para assinatura, archive e upload de stores

## Situação consolidada

- Web release: funcional
- Mobile release: parcialmente estruturada, ainda bloqueada pelo export estático
- Compliance/legal/store metadata: documentação fragmentada; nova documentação em `docs/*` passa a ser a referência desta auditoria
