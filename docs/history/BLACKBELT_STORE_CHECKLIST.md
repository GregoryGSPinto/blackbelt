# BlackBelt — Checklist: App Store & Play Store

> Status: 🔴 Não iniciado | 🟡 Em progresso | 🟢 Concluído
>
> Última revisão: 2026-02-26 (auditoria automatizada contra o codebase)

---

## 1. FUNCIONALIDADE CORE (Pré-requisito)

### 1.1 Backend Real (Supabase)
| # | Item | Status | Notas |
|---|------|--------|-------|
| 1.1.1 | Projeto Supabase criado | 🟢 | conmfnjaqmqrlmjswhru |
| 1.1.2 | 10 migrations aplicadas | 🟢 | 30+ tabelas com RLS |
| 1.1.3 | Seed com dados de teste | 🟡 | `scripts/create-test-user.ts` cria 3 users (admin/professor/aluno); `supabase/seed-test.sql` cria academia demo. Falta rodar em produção |
| 1.1.4 | NEXT_PUBLIC_USE_MOCK=false funcionando | 🔴 | 30+ endpoints TODO(BE-XXX) não implementados. Auth funciona, CRUD não |
| 1.1.5 | Fluxo completo: cadastro → login → dashboard | 🟡 | Auth via Supabase funciona (signUp/signIn). Dashboard carrega só com mock data |
| 1.1.6 | Check-in funcionando | 🟡 | UI completa (QR + manual), tabela `check_ins` existe. API endpoints faltam (BE-060) |
| 1.1.7 | Progressão/graduação funcionando | 🟡 | UI + service layer prontos, tabelas `progression_records`/`exams` existem. API falta |
| 1.1.8 | Notificações realtime | 🟢 | `hooks/useRealtimeNotifications.ts` usa Supabase Realtime (`postgres_changes`). Tabela `notifications` com realtime habilitado |
| 1.1.9 | Upload de avatar/documentos | 🔴 | Service layer mock (`lib/api/storage.service.ts`). Buckets Supabase Storage não configurados |
| 1.1.10 | LGPD: exportar/deletar dados | 🟡 | Página `/excluir-conta` funcional, `lib/persistence/lgpd.ts` com anonimização. Endpoints backend faltam |

### 1.2 Perfis Funcionais
| # | Item | Status | Notas |
|---|------|--------|-------|
| 1.2.1 | Admin: gestão completa da academia | 🟡 | UI completa em `app/(admin)/` — dashboard, check-in, financeiro, graduações. Dados mock |
| 1.2.2 | Professor: turmas, presença, avaliação | 🟡 | UI completa em `app/(professor)/` — dashboard, chamada, alunos, plano-aula. Dados mock |
| 1.2.3 | Aluno Adulto: check-in, progressão, aulas | 🟡 | UI completa em `app/(main)/` — inicio, perfil, aulas. Dados mock |
| 1.2.4 | Teen: interface adaptada | 🟡 | UI completa em `app/(teen)/` — inicio, perfil, conquistas, checkin. `teen.service.ts` mock |
| 1.2.5 | Kids: modo simplificado | 🟡 | UI completa em `app/(kids)/` — inicio, aulas, desafios, medalhas. `kids.service.ts` mock |
| 1.2.6 | Responsável: acompanhar filhos | 🟡 | UI completa em `app/(parent)/` — painel-responsavel. `parent.service.ts` mock |

---

## 2. CAPACITOR — BUILD MOBILE

### 2.1 Setup Inicial
| # | Item | Status | Notas |
|---|------|--------|-------|
| 2.1.1 | Capacitor instalado e configurado | 🟡 | `capacitor.config.ts` completo (plugins, iOS/Android settings). Pacotes `@capacitor/*` **não instalados** no package.json. Script `scripts/capacitor-setup.sh` pronto para rodar |
| 2.1.2 | `npx cap add ios` executado | 🔴 | Pasta `ios/` não existe |
| 2.1.3 | `npx cap add android` executado | 🔴 | Pasta `android/` não existe |
| 2.1.4 | `next export` ou `next build` + `npx cap sync` | 🔴 | |
| 2.1.5 | App abre no simulador iOS | 🔴 | Xcode necessário |
| 2.1.6 | App abre no emulador Android | 🔴 | Android Studio necessário |

### 2.2 Plugins Capacitor Necessários
| # | Item | Status | Notas |
|---|------|--------|-------|
| 2.2.1 | @capacitor/splash-screen | 🟡 | Configurado em `capacitor.config.ts` (2s, dark bg), pacote não instalado |
| 2.2.2 | @capacitor/status-bar | 🟡 | Configurado em `capacitor.config.ts` (dark style), pacote não instalado |
| 2.2.3 | @capacitor/keyboard | 🟡 | Configurado em `capacitor.config.ts` (body resize), pacote não instalado |
| 2.2.4 | @capacitor/push-notifications | 🔴 | FCM (Android) + APNS (iOS) |
| 2.2.5 | @capacitor/camera | 🔴 | Foto de perfil |
| 2.2.6 | @capacitor/haptics | 🔴 | Feedback tátil |
| 2.2.7 | @capacitor/app | 🔴 | Deep links, back button |
| 2.2.8 | @capacitor/browser | 🔴 | Links externos |
| 2.2.9 | @capacitor-mlkit/barcode-scanning | 🔴 | QR Code check-in (alternativa) |

### 2.3 Funcionalidades Nativas
| # | Item | Status | Notas |
|---|------|--------|-------|
| 2.3.1 | Deep links configurados (apple-app-site-association) | 🟡 | `public/.well-known/apple-app-site-association` + `assetlinks.json` existem. `TEAM_ID` placeholder, SHA-256 TODO |
| 2.3.2 | Push notifications (FCM + APNS) | 🔴 | Precisa Firebase project |
| 2.3.3 | Biometria (Face ID / Touch ID) | 🔴 | Opcional, bom ter |
| 2.3.4 | Câmera para QR Code | 🔴 | Check-in |
| 2.3.5 | Modo offline básico | 🟢 | `public/sw.js` com cache-first para static, network-first para API, fallback offline page |

---

## 3. DESIGN & UX (Exigidos pelas Stores)

### 3.1 Ícones & Splash
| # | Item | Status | Notas |
|---|------|--------|-------|
| 3.1.1 | App icon 1024x1024 (iOS) | 🔴 | PNG sem transparência, sem alpha |
| 3.1.2 | App icon 512x512 (Android) | 🔴 | PNG com fundo adaptativo |
| 3.1.3 | Adaptive icon Android (foreground + background) | 🔴 | |
| 3.1.4 | Splash screen 2732x2732 (universal) | 🔴 | |
| 3.1.5 | Favicon e web icons (192, 512) | 🔴 | Referenciados em `manifest.json` mas **arquivos não existem** (`icon-192.png`, `icon-512.png`, `icon-1024.png` faltam em `public/`) |

### 3.2 Screenshots para as Stores
| # | Item | Status | Notas |
|---|------|--------|-------|
| 3.2.1 | iPhone 6.7" (1290×2796) — mín. 3 screenshots | 🔴 | iPhone 15 Pro Max |
| 3.2.2 | iPhone 6.5" (1284×2778) | 🔴 | iPhone 14 Plus |
| 3.2.3 | iPad Pro 12.9" (2048×2732) | 🔴 | Se suportar tablet |
| 3.2.4 | Android Phone (1080×1920) — mín. 2 screenshots | 🔴 | |
| 3.2.5 | Android Tablet 7" e 10" | 🔴 | Se suportar tablet |
| 3.2.6 | Feature graphic Android (1024×500) | 🔴 | Banner da Play Store |

---

## 4. CONTAS DE DESENVOLVEDOR

### 4.1 Apple
| # | Item | Status | Notas |
|---|------|--------|-------|
| 4.1.1 | Apple Developer Account ($99/ano) | 🔴 | developer.apple.com |
| 4.1.2 | Certificado de distribuição criado | 🔴 | Keychain Access |
| 4.1.3 | Provisioning Profile (App Store) | 🔴 | |
| 4.1.4 | App ID registrado (com.blackbelt.app) | 🔴 | |
| 4.1.5 | Push Notification capability ativada | 🔴 | |

### 4.2 Google
| # | Item | Status | Notas |
|---|------|--------|-------|
| 4.2.1 | Google Play Developer Account ($25 único) | 🔴 | play.google.com/console |
| 4.2.2 | Keystore de assinatura gerado | 🔴 | Guardar em lugar seguro! |
| 4.2.3 | Firebase project criado | 🔴 | Para push notifications |
| 4.2.4 | google-services.json baixado | 🔴 | |
| 4.2.5 | SHA-1/SHA-256 fingerprint registrado | 🔴 | |

---

## 5. METADADOS DAS STORES

### 5.1 App Store (iOS)
| # | Item | Status | Notas |
|---|------|--------|-------|
| 5.1.1 | Nome do app (30 chars max) | 🔴 | "BlackBelt" |
| 5.1.2 | Subtítulo (30 chars max) | 🔴 | Ex: "Gestão de Artes Marciais" |
| 5.1.3 | Descrição (4000 chars max) | 🔴 | Português + Inglês |
| 5.1.4 | Keywords (100 chars max) | 🔴 | bjj,artes marciais,academia,check-in... |
| 5.1.5 | Categoria primária | 🔴 | Sports ou Education |
| 5.1.6 | Categoria secundária | 🔴 | Health & Fitness |
| 5.1.7 | URL de suporte | 🔴 | Página web com FAQ/contato |
| 5.1.8 | URL de política de privacidade | 🟢 | Publicada em `https://blackbelt-five.vercel.app/politica-privacidade.html` |
| 5.1.9 | URL de termos de uso | 🟢 | Publicada em `https://blackbelt-five.vercel.app/termos-de-uso.html` |
| 5.1.10 | Classificação etária (Age Rating) | 🔴 | Provavelmente 4+ |
| 5.1.11 | Conta de teste para revisão Apple | 🔴 | Email + senha funcional |
| 5.1.12 | Notas para o revisor | 🔴 | Explicar o que o app faz |

### 5.2 Play Store (Android)
| # | Item | Status | Notas |
|---|------|--------|-------|
| 5.2.1 | Título (50 chars max) | 🔴 | "BlackBelt - Artes Marciais" |
| 5.2.2 | Descrição curta (80 chars max) | 🔴 | |
| 5.2.3 | Descrição completa (4000 chars max) | 🔴 | |
| 5.2.4 | Categoria | 🔴 | Sports ou Education |
| 5.2.5 | Classificação de conteúdo (questionário IARC) | 🔴 | |
| 5.2.6 | Política de privacidade URL | 🟢 | `https://blackbelt-five.vercel.app/politica-privacidade.html` |
| 5.2.7 | Declaração de anúncios | 🔴 | "Sem anúncios" |
| 5.2.8 | Tipo de app (app/jogo) | 🔴 | App |
| 5.2.9 | Target audience (público-alvo) | 🔴 | 13+ (não é app infantil) |
| 5.2.10 | Data Safety form preenchido | 🔴 | Quais dados coleta |
| 5.2.11 | Closed testing antes de produção | 🔴 | Google exige 20 testers por 14 dias |

---

## 6. COMPLIANCE & LEGAL

### 6.1 Privacidade
| # | Item | Status | Notas |
|---|------|--------|-------|
| 6.1.1 | Política de privacidade publicada em URL pública | 🟢 | `public/politica-privacidade.html` — acessível via Vercel |
| 6.1.2 | Termos de uso publicados | 🟢 | `public/termos-de-uso.html` — acessível via Vercel |
| 6.1.3 | LGPD: consentimento no cadastro | 🟢 | `PrivacyConsentModal.tsx` (app-wide), `StepConsentimento.tsx` (teen guardian, LGPD Art.14), `StepRevisao.tsx` (termos finais) |
| 6.1.4 | LGPD: opção de exportar dados | 🟡 | `lib/persistence/lgpd.ts` tem estrutura de export. Falta endpoint backend real |
| 6.1.5 | LGPD: opção de excluir conta | 🟡 | Página `/excluir-conta` funcional com formulário. `lib/persistence/lgpd.ts` tem anonimização (hash CPF, mascarar PII). Falta endpoint backend |
| 6.1.6 | Apple Privacy Nutrition Labels | 🔴 | Declarar no App Store Connect |
| 6.1.7 | Apple PrivacyInfo.xcprivacy | 🟢 | `resources/PrivacyInfo.xcprivacy` — tracking=false, declara UserDefaults/file timestamps/boot time/disk space |
| 6.1.8 | Google Data Safety | 🔴 | Formulário no Play Console |

### 6.2 Segurança
| # | Item | Status | Notas |
|---|------|--------|-------|
| 6.2.1 | HTTPS em todas as conexões | 🟢 | Supabase + Vercel = HTTPS |
| 6.2.2 | Dados sensíveis não em texto claro | 🟡 | CPF com hash irreversível (`lib/persistence/lgpd.ts`). Backend precisa `crypto.createHash('sha256')` real |
| 6.2.3 | API keys não expostas no código | 🟢 | `.env` + Vercel env vars + RLS |
| 6.2.4 | RLS ativo em todas as tabelas | 🟢 | Migrations confirmam RLS |
| 6.2.5 | Certificado SSL pinning (opcional) | 🔴 | Recomendado |

---

## 7. PERFORMANCE & QUALIDADE

| # | Item | Status | Notas |
|---|------|--------|-------|
| 7.1 | App inicia em < 3 segundos | 🔴 | Testar no device real |
| 7.2 | Sem crashes no fluxo principal | 🔴 | Testar todos os perfis |
| 7.3 | Funciona sem internet (modo offline básico) | 🟢 | `public/sw.js` com cache-first (static), network-first (API), offline fallback HTML |
| 7.4 | Sentry/error tracking configurado | 🟡 | `sentry.{client,server,edge}.config.ts` completos, PII filtering LGPD. Falta DSN real (`NEXT_PUBLIC_SENTRY_DSN`) |
| 7.5 | Tela de carregamento (skeleton/loading) | 🟢 | `SkeletonLoader.tsx` (10+ variantes), `PremiumLoading.tsx` (animação com progress). Usado em 21+ arquivos |
| 7.6 | Back button Android funciona corretamente | 🔴 | Precisa @capacitor/app plugin |
| 7.7 | Safe area insets (notch, home indicator) | 🟢 | `viewportFit: 'cover'` em `layout.tsx`, `env(safe-area-inset-*)` em CSS + componentes |
| 7.8 | Teclado não sobrepõe inputs | 🟡 | CSS `keyboard-safe-area` existe, `capacitor.config.ts` configura Keyboard plugin (body resize). Plugin não instalado ainda |
| 7.9 | Dark mode consistente | 🟢 | Dark-by-default via `ThemeContext.tsx`. Paleta completa em `tailwind.config.ts` |
| 7.10 | Sem memory leaks em navegação | 🔴 | Profiling necessário |

---

## 8. BUILD & SUBMISSÃO

### 8.1 iOS Build
| # | Item | Status | Notas |
|---|------|--------|-------|
| 8.1.1 | Xcode 15+ instalado | 🔴 | Mac obrigatório |
| 8.1.2 | `npx cap sync ios` sem erros | 🔴 | |
| 8.1.3 | Pod install sem erros | 🔴 | CocoaPods |
| 8.1.4 | Build no Xcode sem warnings críticos | 🔴 | |
| 8.1.5 | Teste em device real (TestFlight) | 🔴 | |
| 8.1.6 | Archive + Upload para App Store Connect | 🔴 | |
| 8.1.7 | Preencher tudo no App Store Connect | 🔴 | |
| 8.1.8 | Submeter para revisão | 🔴 | 1-3 dias de espera |

### 8.2 Android Build
| # | Item | Status | Notas |
|---|------|--------|-------|
| 8.2.1 | Android Studio instalado | 🔴 | |
| 8.2.2 | `npx cap sync android` sem erros | 🔴 | |
| 8.2.3 | Build APK/AAB sem erros | 🔴 | AAB para Play Store |
| 8.2.4 | Teste em device real | 🔴 | |
| 8.2.5 | Gerar AAB assinado | 🔴 | |
| 8.2.6 | Upload para Play Console | 🔴 | |
| 8.2.7 | Closed testing (20 testers, 14 dias) | 🔴 | Google exige isso! |
| 8.2.8 | Submeter para produção | 🔴 | 3-7 dias de revisão |

---

## 9. PÓS-LANÇAMENTO

| # | Item | Status | Notas |
|---|------|--------|-------|
| 9.1 | Analytics configurado (ex: PostHog, Mixpanel) | 🔴 | Consent UI existe (`PrivacyConsentModal` tem toggle analytics) mas nenhum provider integrado |
| 9.2 | Crash reporting ativo (Sentry) | 🟡 | Configs completas com PII redaction. Falta DSN de produção |
| 9.3 | Processo de CI/CD para atualizações | 🟢 | `.github/workflows/ci.yml` (lint+test+build), `supabase-deploy.yml` (migrations auto-deploy) |
| 9.4 | Domínio customizado (blackbelt.app ou similar) | 🔴 | Atualmente em `blackbelt-five.vercel.app` |
| 9.5 | Email transacional (welcome, reset senha) | 🟡 | Supabase Auth emails habilitados (`config.toml`). Templates customizados não configurados |
| 9.6 | Suporte ao usuário (email ou chat) | 🔴 | |

---

## CONTAGEM ATUALIZADA

| Status | Qtd | % |
|--------|-----|---|
| 🟢 Concluído | 24 | 25% |
| 🟡 Em progresso | 25 | 26% |
| 🔴 Não iniciado | 48 | 49% |
| **Total** | **97** | |

---

## GAPS CRÍTICOS (bloqueiam publicação)

### 1. Backend API — O MAIOR GAP
**30+ endpoints `TODO(BE-XXX)` não implementados.** Toda a UI existe, toda a service layer está preparada com padrão mock/real, mas os API route handlers em `app/api/` não fazem CRUD real no Supabase. Sem isso, `NEXT_PUBLIC_USE_MOCK=false` quebra o app.

### 2. Ícones inexistentes
`manifest.json` referencia `icon-192.png`, `icon-512.png`, `icon-1024.png` mas **nenhum existe em `public/`**. PWA broken.

### 3. Capacitor não instalado
`capacitor.config.ts` e `scripts/capacitor-setup.sh` existem, mas nenhum pacote `@capacitor/*` está no `package.json`. Sem `ios/` nem `android/`.

### 4. Contas de desenvolvedor
Nem Apple Developer ($99/ano) nem Google Play ($25) foram criadas.

---

## PRÓXIMO PASSO CONCRETO

**Implementar os API route handlers para substituir os mocks.**

O projeto tem uma arquitetura mock/real extremamente bem preparada: cada `*.service.ts` tem um `if (useMock()) { return mockData }` seguido de uma chamada real. O que falta é o outro lado — os handlers em `app/api/`. A abordagem recomendada:

1. Começar por **Auth + Profile** (já parcialmente real)
2. Depois **Check-in** (fluxo core do app)
3. Depois **Turmas + Alunos** (CRUD básico)
4. Testar com `NEXT_PUBLIC_USE_MOCK=false`
5. Rodar seed (`scripts/create-test-user.ts`) no Supabase de produção

Isso desbloqueia todo o resto — sem backend real, não há app para submeter às stores.

---

## RESUMO POR PRIORIDADE

### Sprint 1 — Backend Real (1-2 semanas)
- [ ] 1.1.4 — Implementar 30+ API endpoints (TODO BE-XXX)
- [ ] 1.1.3 — Rodar seed no Supabase produção
- [ ] 1.1.5 a 1.1.10 — Validar fluxos com dados reais
- [ ] 1.2.1 a 1.2.6 — Todos os perfis com CRUD real

### Sprint 2 — Build Mobile (1 semana)
- [ ] 2.1.1 a 2.1.6 — `bash scripts/capacitor-setup.sh` + iOS/Android
- [ ] 2.2.* — Plugins necessários (3 já configurados)
- [ ] 2.3.* — Push, câmera, deep links
- [ ] 3.1.5 — Criar ícones (bloqueia PWA e mobile)

### Sprint 3 — Design Assets (3-5 dias)
- [ ] 3.1.* — Ícones e splash screen
- [ ] 3.2.* — Screenshots para as stores

### Sprint 4 — Contas & Legal (2-3 dias)
- [ ] 4.1.* — Apple Developer Account
- [ ] 4.2.* — Google Play Account
- [ ] 6.1.4/6.1.5 — Conectar LGPD export/delete ao backend real

### Sprint 5 — Teste & Submissão (1-2 semanas)
- [ ] 7.* — Performance e qualidade
- [ ] 8.1.* — Build iOS + TestFlight
- [ ] 8.2.* — Build Android + Closed Testing
- [ ] 5.* — Metadados das stores

### Total estimado: 5-7 semanas até publicação

---

## CUSTOS

| Item | Valor | Recorrência |
|------|-------|-------------|
| Apple Developer Account | $99 (R$500~) | Anual |
| Google Play Developer | $25 (R$130~) | Único |
| Supabase Pro (se ultrapassar free) | $25/mês | Mensal |
| Vercel Pro (se ultrapassar free) | $20/mês | Mensal |
| Domínio customizado | ~R$50/ano | Anual |
| Sentry (free tier) | $0 | - |
| **Total para lançar** | **~R$700** | |
| **Mensal após lançar** | **R$0-250** | Depende do uso |
