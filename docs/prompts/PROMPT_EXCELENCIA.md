# BlackBelt — Prompt de Excelência para Claude Code

Cole este prompt inteiro no Claude Code:

---

Leia o BLACKBELT_STORE_CHECKLIST.md atualizado e execute as seguintes tarefas em sequência para levar o app a nível de produção. Para cada bloco, faça build (`pnpm build`) e corrija erros antes de avançar. Commita após cada bloco com mensagem descritiva.

## BLOCO 1 — Ícones & PWA (bloqueia tudo)

O `manifest.json` referencia ícones que NÃO existem em `public/`. Isso quebra o PWA.

1. Gere via código (SVG→PNG ou Canvas) os ícones do BlackBelt:
   - `public/icon-192.png` (192x192)
   - `public/icon-512.png` (512x512)
   - `public/icon-1024.png` (1024x1024)
   - `public/favicon.ico` (32x32)
   - Design: fundo escuro (#1a1a2e), faixa preta estilizada (🥋) em branco/dourado, texto "BB" se necessário
2. Valide que `manifest.json` aponta para os caminhos corretos
3. Gere `public/apple-touch-icon.png` (180x180) para iOS PWA
4. Crie `public/splash-2732x2732.png` (splash universal) com logo centralizado, fundo escuro

## BLOCO 2 — Capacitor Setup Completo

O `capacitor.config.ts` existe mas nenhum pacote está instalado.

1. Instale os pacotes core:
```bash
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/app @capacitor/haptics @capacitor/browser
```
2. Execute `npx cap add ios && npx cap add android`
3. Execute `npx cap sync`
4. Verifique que `ios/` e `android/` foram criados sem erros
5. Configure em `android/app/src/main/res/` os ícones adaptativos (mipmap) usando os PNGs gerados
6. Configure em `ios/App/App/Assets.xcassets/AppIcon.appiconset/` o icon set
7. Atualize `capacitor.config.ts` se necessário para apontar webDir para o output correto do Next.js

## BLOCO 3 — API Endpoints Restantes

Verifique todos os `*.service.ts` em `lib/api/` que têm padrão mock/real. Para cada um que ainda retorna mock data quando `NEXT_PUBLIC_USE_MOCK=false`:

1. Implemente o handler real em `app/api/` usando `createServerClient` do Supabase
2. Mapeie cada endpoint para as tabelas corretas das migrations (academies, profiles, memberships, class_schedules, attendances, progression_records, etc.)
3. Aplique validação de input com zod
4. Retorne erros tipados `{ error: string, code: string }`
5. Os endpoints críticos em ordem de prioridade:
   - GET/POST `/api/academies` — CRUD academia
   - GET/PUT `/api/members` — listar e atualizar membros
   - GET/POST `/api/classes` — turmas e sessões
   - POST `/api/checkin` — registrar presença (core do app)
   - GET/POST `/api/progression` — graduação e promoções
   - GET `/api/financial` — assinaturas e pagamentos
   - GET `/api/gamification` — pontos, streaks, conquistas
   - POST `/api/lgpd/export` e `/api/lgpd/delete` — LGPD compliance
6. Teste cada endpoint: `curl -X GET http://localhost:3000/api/academies -H "Authorization: Bearer TOKEN"`

## BLOCO 4 — Seed & Validação Real

1. Crie/atualize `supabase/seed.sql` com dados completos de teste:
   - 1 academia "Dojo BlackBelt Demo"
   - 3 usuários: admin@blackbelt.test (Admin), professor@blackbelt.test (Professor), aluno@blackbelt.test (Aluno)
   - 2 turmas com horários
   - 5 alunos com diferentes graduações
   - 10 registros de presença
   - 3 promoções de faixa
   - Dados de gamification (pontos, streaks)
2. Aplique o seed: `npx supabase db reset --linked` (só se for seguro) ou insira via SQL no Supabase dashboard
3. Altere `.env.local` para `NEXT_PUBLIC_USE_MOCK=false`
4. Rode `pnpm dev` e valide TODOS os fluxos:
   - Login com cada perfil
   - Dashboard carrega dados reais
   - Check-in funciona
   - Lista de turmas e alunos
   - Progressão/graduação
5. Corrija qualquer erro encontrado
6. Volte `NEXT_PUBLIC_USE_MOCK=true` após validar (para não quebrar produção)

## BLOCO 5 — Segurança & Polish

1. Verifique que nenhuma API key ou secret está hardcoded no código (grep por `eyJ`, `sk_`, `secret`)
2. Implemente rate limiting real nos API routes (não só middleware)
3. Adicione headers de segurança no `next.config.js`:
   ```js
   headers: [{ key: 'X-Frame-Options', value: 'DENY' }, { key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }]
   ```
4. Verifique que o `PrivacyInfo.xcprivacy` está correto e será copiado para o bundle iOS
5. Valide que `robots.txt` e `sitemap.xml` existem em `public/`
6. Verifique que a página `/offline` funciona quando desconectado

## BLOCO 6 — Testes & Build Final

1. Rode `pnpm build` — ZERO erros
2. Rode `pnpm lint` — corrija warnings críticos
3. Verifique que todas as páginas renderizam sem erros no console:
   - `/` (landing)
   - `/login`
   - `/dashboard`
   - `/turmas`
   - `/check-in`
   - `/perfil`
   - `/painel-professor`
4. Verifique responsividade mobile (todas as páginas devem funcionar em 375px width)
5. Se existirem testes (`*.test.ts`), rode `pnpm test` e corrija falhas

## BLOCO 7 — Deploy & Commit Final

1. `git add -A`
2. `git commit -m "feat: production-ready — icons, capacitor, API endpoints, seed, security hardening"`
3. `git push origin main`
4. `vercel --prod --yes` (se auto-deploy não estiver configurado)
5. Verifique https://blackbelt-five.vercel.app funciona sem erros
6. Atualize o `BLACKBELT_STORE_CHECKLIST.md` com os novos status

## REGRAS

- NÃO pule blocos. Execute na ordem.
- Se um build falhar, corrija ANTES de avançar.
- Commita após cada bloco (não acumule tudo no final).
- Se algum bloco for impossível sem intervenção manual (ex: criar conta Apple), documente o que falta e pule.
- Prefira soluções robustas a gambiarras. Este é código de produção.
- Mantenha o padrão arquitetural existente: Server Actions + Supabase client, dual-mode mock/real, TypeScript strict.
