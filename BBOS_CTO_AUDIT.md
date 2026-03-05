# BBOS — CTO Audit & Codebase Hardening

> Execute este prompt ANTES do BBOS_IMPLEMENTATION_GUIDE_v2.md.
> Objetivo: revisar e corrigir o codebase inteiro para entregar uma base
> funcional, limpa e production-grade antes de evoluir.

---

## REGRAS ABSOLUTAS

1. **NÃO reescreva o que funciona.** Se algo está correto, não toque.
2. **NÃO delete o Domain Engine.** Os 7 bounded contexts, 12 events, 8 projectors são o coração do sistema.
3. **NÃO delete os 7 ML engines.** A Intelligence Layer (296 testes) é patrimônio.
4. **NÃO mude os DTOs dos 41 services.** O contrato com o frontend não pode quebrar.
5. **DOCUMENTE tudo** que encontrar e corrigir no arquivo `CTO_AUDIT_REPORT.md`.
6. **COMMITE após cada bloco** com mensagem descritiva.
7. **Rode `pnpm build` após cada bloco** — zero erros obrigatório.
8. **Rode `npx vitest run` após cada bloco** — testes não podem regredir.

---

## BLOCO 1 — Segurança (URGENTE)

### 1.1 — Remoção de secrets expostos

```
TAREFA CRÍTICA:

1. Verifique se .env.local.save existe no repo.
   Se SIM → remova do git e adicione ao .gitignore:
   git rm --cached .env.local.save 2>/dev/null
   echo ".env.local.save" >> .gitignore

2. Verifique se .env.local está no repo (NÃO deve estar):
   git ls-files .env.local
   Se retornar algo → git rm --cached .env.local

3. Verifique se .env.production contém secrets reais:
   cat .env.production
   Se contiver SUPABASE_URL, ANON_KEY ou SERVICE_ROLE_KEY reais (não placeholders):
   → Substitua por placeholders
   → Documente no audit report que as keys precisam ser rotacionadas

4. Scan completo por secrets hardcoded:
   grep -rn "supabase_service_role\|sk-ant-\|eyJhbGci\|sb-\|SUPABASE_SERVICE_ROLE" \
     --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" \
     --exclude-dir=node_modules --exclude-dir=.next .
   
   Se encontrar → remova e use process.env

5. Verifique .gitignore está completo:
   Deve incluir: .env, .env.local, .env.local.save, .env.*.local,
   node_modules, .next, .DS_Store, *.tsbuildinfo

6. Commit: "security: remove exposed secrets + harden gitignore"
```

### 1.2 — Middleware Edge Runtime

```
O middleware já crashou em produção com MIDDLEWARE_INVOCATION_FAILED.

1. Leia middleware.ts completamente.

2. Verifique que NÃO importa nenhum módulo incompatível com Edge Runtime:
   - ❌ 'fs', 'path', 'crypto', 'os' (Node.js APIs)
   - ❌ lib/supabase/server.ts (usa cookies() de next/headers)
   - ❌ lib/supabase/admin.ts (service role no edge é perigoso)
   - ❌ Qualquer arquivo que importe pg, dotenv, ou dependências Node-only

3. O middleware DEVE:
   - Usar APENAS: next/server (NextRequest, NextResponse), @supabase/ssr
   - Ter try/catch global — se QUALQUER coisa falhar, retorna NextResponse.next()
   - Quando NEXT_PUBLIC_USE_MOCK=true: só headers de segurança + redirects, ZERO Supabase
   - Quando NEXT_PUBLIC_USE_MOCK=false: session refresh via @supabase/ssr

4. Verifique que TODAS as rotas públicas estão no array PUBLIC_ROUTES:
   /landing, /login, /cadastro, /esqueci-senha, /politica-privacidade,
   /termos-de-uso, /api/health, /_next, /favicon.ico, /manifest.json,
   /sw.js, /robots.txt, /sitemap.xml

5. Security headers obrigatórios:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: camera=(), microphone=(), geolocation=(self)

6. Teste: pnpm build && pnpm start — acesse localhost:3000/landing (deve dar 200)

7. Commit: "fix: middleware edge runtime hardened — no more MIDDLEWARE_INVOCATION_FAILED"
```

---

## BLOCO 2 — Build & TypeScript

### 2.1 — Audit de Build

```
1. Rode pnpm build e capture TODOS os erros e warnings.

2. Para CADA erro:
   a) Import não encontrado → Verifique se o arquivo existe.
      Se o módulo deveria existir mas não existe → crie stub funcional.
      Se é import morto (de feature removida) → remova o import.
   b) Tipo incorreto → corrija o tipo sem mudar a interface pública.
   c) Componente não encontrado → crie placeholder funcional ou remova referência.
   d) Parâmetro faltando → adicione com valor default.

3. Rode pnpm lint e corrija TODOS os erros (não warnings).
   Para warnings: corrija os críticos, ignore os cosméticos.

4. Rode pnpm typecheck (ou npx tsc --noEmit).
   ZERO erros.

5. Verifique que pnpm dev roda sem crash.
   - / → redireciona para /landing ou /login
   - /landing → renderiza sem erro
   - /login → renderiza sem erro
   - Login mock funciona → redireciona para dashboard correto por perfil

6. Commit: "fix: build, lint, typecheck — zero errors"
```

### 2.2 — Dead Code & Imports

```
1. Encontre e remova imports não utilizados em TODOS os arquivos .ts/.tsx:
   Rode: npx knip --reporter compact (se disponível)
   Ou: grep -rn "^import" --include="*.ts" --include="*.tsx" . | 
       (para cada import, verificar se é usado no arquivo)

2. Encontre arquivos que NÃO são importados por nenhum outro arquivo:
   - Componentes órfãos em components/ que nenhuma página usa
   - Services em lib/api/ sem nenhum import
   - Hooks em hooks/ sem nenhum import
   NÃO delete ainda — marque no audit report como "candidato a remoção"

3. Encontre e remova console.log() de produção:
   grep -rn "console\.log" --include="*.ts" --include="*.tsx" \
     --exclude-dir=node_modules --exclude-dir=.next .
   Substitua por:
   - Se é debug temporário → remova
   - Se é log útil → use o logger estruturado de lib/monitoring/

4. Encontre TODO/FIXME/HACK e documente:
   grep -rn "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.tsx" \
     --exclude-dir=node_modules .
   Liste todos no audit report com arquivo e linha.

5. Commit: "chore: remove dead code, unused imports, console.logs"
```

---

## BLOCO 3 — Domain Engine Integrity

### 3.1 — Event Sourcing Consistency

```
1. Leia e verifique CADA arquivo em lib/domain/:

   lib/domain/events/domain-events.ts:
   - Todos os 12 eventos têm type discriminator único?
   - makeIdempotencyKey é determinístico (sem timestamp/random)?
   - humanDescription está presente em todos os tipos?
   - Schema version está definido?
   - Causal chain guard (max depth 10) funciona?

   lib/domain/events/event-governance.ts (se existir):
   - Contratos de eventos estão congelados?
   - Regras de versionamento estão documentadas?

   lib/domain/participant/:
   - PersonIdentity tem todos os campos LGPD?
   - anonymizePerson() funciona corretamente?
   - Participant aggregate é consistente?

   lib/domain/development/:
   - DevelopmentTrack tem tipos corretos?
   - Progressão segue regras do domínio?

   lib/domain/shared/time.ts:
   - utcNow() é usado em vez de Date.now() em todo o domínio?
   - Verifique se algum arquivo do domínio usa new Date() diretamente
     → Se sim, migre para utcNow()

2. Verifique que NENHUM arquivo em lib/domain/ faz:
   - Import de React (domínio é puro, sem UI)
   - Import de Supabase (domínio não conhece infra)
   - Import de next/ (domínio não conhece framework)
   - fetch() ou chamada HTTP (domínio é síncrono e puro)
   - Mutação de estado global (tudo deve ser immutable)

3. Verifique lib/application/progression/projectors/:
   - Todos os 8 projectors são funções puras?
   - Input → Output sem side effects?
   - Testes existem e passam?

4. Verifique lib/application/events/event-wiring.ts:
   - Todos os subscribers estão registrados?
   - Não há listeners duplicados?
   - Não há circular dependencies?

5. Documente no audit report:
   - Quantos eventos, projectors, bounded contexts
   - Qualquer violação de boundaries encontrada
   - Qualquer inconsistência de tipos

6. Commit: "audit: domain engine integrity verified + boundary violations fixed"
```

---

## BLOCO 4 — Intelligence Layer (ML)

### 4.1 — ML Engines Verification

```
1. Leia lib/domain/intelligence/ completo.

2. Verifique CADA engine:
   - lib/domain/intelligence/engines/churn-engine.ts
   - lib/domain/intelligence/engines/adaptive-difficulty.ts
   - lib/domain/intelligence/engines/student-dna.ts
   - lib/domain/intelligence/engines/class-optimizer.ts
   - lib/domain/intelligence/engines/instructor-coach.ts
   - lib/domain/intelligence/engines/engagement-scorer.ts
   - lib/domain/intelligence/engines/promotion-predictor.ts
   - lib/domain/intelligence/engines/social-graph.ts (se existir)

   Para CADA engine verifique:
   a) É função pura? (input → output, sem side effects, sem fetch, sem state)
   b) Tipos estão corretos? (input types, output types)
   c) Pesos/thresholds fazem sentido? (não são 0, não são absurdamente altos)
   d) Edge cases tratados? (dados vazios, null, undefined, arrays vazios)
   e) Export está correto?

3. Verifique os 7 projectors de ML:
   lib/domain/intelligence/projectors/
   - admin, professor, adult, teen, kids, parent, super-admin
   Cada um deve receber dados e retornar ViewModel tipado.

4. Rode os testes de ML:
   npx vitest run tests/ai/
   Todos os 296 testes devem passar.
   Se algum falhar → corrija o teste OU o engine (use julgamento senior).

5. Verifique ACL mappers de ML:
   lib/domain/intelligence/acl/ ou similar
   - Traduzem dados de domínio para input dos engines corretamente?

6. Documente no audit report:
   - Score atual de cada engine (funcional/parcial/quebrado)
   - Testes passando/falhando
   - Recomendações de melhoria

7. Commit: "audit: intelligence layer verified — N/296 tests passing"
```

---

## BLOCO 5 — API Services & Backend

### 5.1 — Audit dos 41 Services

```
1. Liste TODOS os services em lib/api/:
   ls -la lib/api/*.service.ts | wc -l
   
2. Para CADA service, classifique:

   CATEGORIA A — Implementação real funcional:
   O branch else (quando isMock() === false) chama Supabase e funciona.

   CATEGORIA B — Implementação real parcial:
   O branch else existe mas está incompleto, tem TODO, ou só faz throw.

   CATEGORIA C — Mock only:
   O branch else está vazio, comentado, ou não existe.

3. Documente no audit report como tabela:
   | Service | Categoria | Problema |
   |---------|-----------|----------|
   | auth.service.ts | A/B/C | descrição |

4. Para CADA service CATEGORIA B (parcial):
   - Complete a implementação usando as queries de lib/db/queries/
   - Se a query necessária não existir, crie
   - Mantenha o mesmo DTO — frontend NÃO pode quebrar

5. Para CADA service CATEGORIA C (mock only):
   NÃO implemente agora. Apenas:
   - Verifique que o mock funciona corretamente
   - Verifique que o DTO está bem tipado
   - Adicione comentário: // TODO(BBOS-Phase-X): implement real backend
   - Documente qual tabela Supabase é necessária

6. Verifique que handleServiceError() é usado consistentemente em todos os services.

7. Verifique que NENHUM service tem:
   - any type (deve ser tipado)
   - Hardcoded URLs (deve usar env vars)
   - Secrets no código (deve usar process.env)

8. Commit: "audit: 41 services classified + partial implementations completed"
```

### 5.2 — Supabase Migrations Consistency

```
1. Liste todas as migrations:
   ls -la supabase/migrations/

2. Para CADA migration, verifique:
   a) SQL é válido (sem erros de sintaxe)
   b) Tabelas referenciadas existem (foreign keys apontam para tabelas reais)
   c) RLS está habilitado (ENABLE ROW LEVEL SECURITY)
   d) Policies existem (ao menos 1 policy por tabela)
   e) Índices relevantes estão criados
   f) Triggers de updated_at existem onde necessário
   g) NÃO tem DROP TABLE sem IF EXISTS
   h) NÃO tem dados sensíveis no seed

3. Verifique consistência entre migrations e queries:
   - Cada tabela usada em lib/db/queries/ existe em alguma migration?
   - Cada coluna referenciada no TypeScript existe na migration SQL?

4. Verifique tipos gerados:
   - lib/supabase/types.ts existe e está atualizado?
   - Os tipos correspondem ao schema real?
   Se desatualizado → documente como regenerar

5. Documente no audit report:
   - Lista de todas as tabelas
   - Tabelas sem RLS (CRÍTICO)
   - Tabelas sem índices (PERFORMANCE)
   - Foreign keys inconsistentes

6. Corrija o que for encontrado diretamente nos SQLs.
   Se precisar de nova migration corretiva, crie com próximo número sequencial.

7. Commit: "audit: migrations consistency verified + corrections applied"
```

---

## BLOCO 6 — Frontend & UX

### 6.1 — Rotas e Navegação

```
1. Mapeie TODAS as rotas do app:
   find app/ -name "page.tsx" -o -name "layout.tsx" | sort

2. Para CADA rota, verifique:
   a) O arquivo existe e exporta um componente válido
   b) Não tem import de módulo inexistente
   c) O layout correspondente existe
   d) Não é uma página vazia ou só com "TODO"

3. Verifique navegação por perfil:
   ADMIN: /(admin)/ — dashboard, membros, turmas, financeiro, configurações
   PROFESSOR: /(professor)/ — dashboard, turmas, alunos, pedagógico
   ADULTO: /(main)/ — dashboard, treinos, progresso, conteúdo
   TEEN: /(teen)/ — dashboard, treinos, conquistas
   KIDS: /(kids)/ — dashboard, missões, conquistas
   PARENT: /(parent)/ — dashboard, filhos, mensagens, financeiro

   Para CADA rota de CADA perfil:
   - Carrega sem erro? (imports ok, componentes ok)
   - Tem loading state? (skeleton ou spinner)
   - Tem error state? (PageError ou similar)
   - Tem empty state? (quando não tem dados)

4. Verifique que o menu lateral (shell/sidebar) tem links corretos para cada perfil.

5. Verifique redirects:
   - / → /landing (se não autenticado) ou /dashboard (se autenticado)
   - /login → /dashboard (se já logado)
   - Perfil errado → redirect para perfil correto

6. Documente no audit:
   - Rotas funcionais
   - Rotas quebradas (import error, 404, tela branca)
   - Rotas sem loading/error/empty state

7. Corrija todas as rotas quebradas.

8. Commit: "fix: all routes verified + broken routes fixed"
```

### 6.2 — Componentes Compartilhados

```
1. Verifique components/shared/:
   - ConfirmModal — funciona?
   - Toast — integrado com ToastContext?
   - PageError — usado consistentemente?
   - LoadingSkeleton — padrão consistente?
   - EmptyState — existe?

2. Verifique components/shell/:
   - AppShell — renderiza header + sidebar + content?
   - Header — mostra nome do usuário, avatar, notificações?
   - Sidebar/Nav — links corretos por perfil?
   - Drawer — funciona no mobile?
   - Theme toggle — dark/light funciona?

3. Verifique components/auth/:
   - Login — formulário funcional + validação?
   - ProfileSelection — selector de perfil se múltiplos?
   - ProtectedRoute — redirect se não autenticado?

4. Verifique components/checkin/:
   - FABCheckin — botão flutuante funcional?
   - Adaptativo mobile/desktop?

5. Para CADA componente:
   - Props tipadas? (nenhum any)
   - Acessibilidade? (aria-labels nos botões/links)
   - Responsive? (funciona em mobile e desktop)
   - Dark mode? (cores respeitam tema)

6. Corrija problemas encontrados.

7. Commit: "fix: shared components reviewed + issues fixed"
```

---

## BLOCO 7 — Contexts & State Management

### 7.1 — React Contexts

```
1. Liste e verifique TODOS os contexts em contexts/:

   AuthContext:
   - Login funciona (mock e real)?
   - Logout limpa estado completamente?
   - Refresh token funciona?
   - Redirect após login vai para o perfil correto?
   - getUser() retorna dados consistentes?
   - Tem loading state enquanto verifica auth?

   ThemeContext:
   - Toggle dark/light funciona?
   - Persiste preferência (localStorage ou cookie)?
   - Todas as cores mudam corretamente?
   
   ToastContext:
   - showToast() funciona com success/error/warning/info?
   - Auto-dismiss após timeout?
   - Não sobrepõe múltiplos toasts?

   Outros contexts (listar quais existem):
   - Cada um tem Provider no layout correto?
   - Nenhum context importa outro context circularmente?

2. Verifique hooks/:
   - Cada hook tem tipo de retorno explícito?
   - useBreakpoint — funciona para mobile/desktop detection?
   - useOfflineCheckin — funciona ou é stub?
   - Outros hooks — listar e verificar

3. Verifique lib/security/token-store.ts:
   - Tokens armazenados em memória (não localStorage)?
   - Refresh automático funciona?
   - Expiração tratada?

4. Corrija problemas de state management.

5. Commit: "fix: contexts and state management reviewed + fixed"
```

---

## BLOCO 8 — Dual Event Store Resolution

### 8.1 — Mapear e Documentar

```
O BlackBelt tem DOIS event stores operando em paralelo. Isso é tech debt crítico.

1. Analise lib/event-store/:
   - Qual adapter existe? (event-store.ts)
   - Quais métodos implementa?
   - Usa Supabase client?

2. Analise server/src/infrastructure/event-store/:
   - Qual adapter existe? (postgres-event-store.ts)
   - Quais métodos implementa?
   - Usa pg driver direto?

3. Documente no audit report:
   | Funcionalidade | Supabase Adapter | Postgres Adapter |
   |----------------|------------------|------------------|
   | appendEvents   | sim/não          | sim/não          |
   | getEvents      | sim/não          | sim/não          |
   | deduplication  | sim/não          | sim/não          |
   | snapshots      | sim/não          | sim/não          |
   | replay         | sim/não          | sim/não          |
   | batch append   | sim/não          | sim/não          |
   | retry          | sim/não          | sim/não          |

4. Identifique qual adapter é CHAMADO em runtime:
   grep -rn "eventStore\|EventStore\|event-store\|event_store" \
     --include="*.ts" --include="*.tsx" \
     --exclude-dir=node_modules --exclude-dir=.next .
   
   Quais arquivos usam qual adapter?

5. NÃO unifique neste bloco — apenas documente para o BBOS Implementation Guide.
   A unificação será feita no Prompt 0.1 do guide.

6. Commit: "docs: dual event store audit documented"
```

---

## BLOCO 9 — Tests & CI/CD

### 9.1 — Test Suite

```
1. Rode TODOS os testes:
   npx vitest run 2>&1

2. Documente:
   - Total de testes
   - Passando
   - Falhando (lista cada um com nome e razão)
   - Skipped

3. Para cada teste falhando:
   a) Se o teste está correto e o código está errado → corrija o código
   b) Se o teste está desatualizado → atualize o teste
   c) Se o teste depende de infra externa → marque como skip com comentário

4. Verifique cobertura de testes:
   - Domain engine: deve ter testes
   - ML engines: deve ter testes (296 existentes)
   - Services: pelo menos os críticos (auth, checkin)
   - Componentes: não obrigatório agora

5. Commit: "test: all tests passing — N total, 0 failures"
```

### 9.2 — CI/CD Pipeline

```
1. Leia .github/workflows/ — todos os arquivos.

2. Verifique ci.yml:
   - Roda em push/PR para main?
   - Steps: install → lint → typecheck → test → build?
   - Usa pnpm (não npm)?
   - Cache de pnpm funciona?

3. Verifique supabase-deploy.yml:
   - Trigger correto (supabase/migrations/**)?
   - Usa secrets corretos?

4. Verifique se falta algum workflow:
   - Build de preview para PRs? (nice to have, não obrigatório)
   - Dependabot ou renovate? (nice to have)

5. Verifique Vercel:
   - vercel.json existe e está correto?
   - Build command correto?
   - Output directory correto?

6. Corrija problemas encontrados no CI.

7. Commit: "fix: CI/CD pipeline verified + issues fixed"
```

---

## BLOCO 10 — Performance & Bundle

### 10.1 — Bundle Analysis

```
1. Rode: ANALYZE=true pnpm build (ou npx @next/bundle-analyzer)
   Se não configurado, adicione:
   - pnpm add -D @next/bundle-analyzer
   - Configure em next.config.js

2. Identifique:
   a) Dependências pesadas no client bundle (>100KB)
   b) Imports dinâmicos que deveriam existir mas não existem
      (ex: modais, gráficos recharts, editor)
   c) Duplicação de código entre chunks

3. Otimize:
   - Componentes pesados → dynamic import com loading
   - Recharts → dynamic import (se usado)
   - Páginas raramente acessadas → lazy load
   - Imagens → verificar que usam next/image (não <img>)

4. Verifique next.config.js:
   - Images domains configurados (Supabase Storage URL)
   - Redirects necessários existem
   - Headers de segurança configurados
   - Webpack customizations são necessárias?

5. Commit: "perf: bundle optimized — dynamic imports + tree shaking"
```

---

## BLOCO 11 — Documentation & Cleanup

### 11.1 — Limpar raiz do projeto

```
1. Liste TODOS os .md na raiz:
   ls -la *.md

   Mapeie quais são úteis e quais são lixo:
   - README.md → MANTER (atualizar se necessário)
   - SETUP.md → MANTER
   - BLACKBELT_ROADMAP.md → MANTER (legacy roadmap)
   - BBOS_IMPLEMENTATION_GUIDE_v2.md → MANTER (novo roadmap)
   - CTO_AUDIT_REPORT.md → MANTER (gerado por este prompt)
   - AI-FULL-IMPLEMENTATION-LOG.md → MOVER para docs/
   - AI-IMPLEMENTATION-LOG.md → MOVER para docs/
   - BLACKBELT-SCAN.md → MOVER para docs/
   - BLACKBELT_STORE_CHECKLIST.md → MOVER para docs/
   - MOCK_REORGANIZATION.md → MOVER para docs/
   - MONOLITH_REFACTORING.md → MOVER para docs/
   - PROMPT_EXCELENCIA.md → MOVER para docs/
   - TODO_AUDIT.md → MOVER para docs/
   - prompt-ml-full-blackbelt.md → MOVER para docs/prompts/

2. Mova arquivos de log/histórico para docs/:
   mkdir -p docs/history docs/prompts
   mv AI-*.md docs/history/
   mv BLACKBELT-SCAN.md docs/history/
   mv *CHECKLIST*.md docs/history/
   mv MOCK_*.md docs/history/
   mv MONOLITH_*.md docs/history/
   mv PROMPT_*.md docs/prompts/
   mv prompt-*.md docs/prompts/
   mv TODO_AUDIT.md docs/history/

3. Atualize README.md:
   - Estrutura do projeto atualizada
   - Comandos atualizados
   - Link para BBOS_IMPLEMENTATION_GUIDE_v2.md
   - Badge: "Build: passing" (se CI está verde)

4. Verifique que .claude/ não contém nada sensível.

5. Commit: "chore: organize project root — docs moved to docs/"
```

### 11.2 — Gerar Audit Report Final

```
Crie CTO_AUDIT_REPORT.md na raiz com:

# BlackBelt — CTO Audit Report
> Data: [data atual]
> Auditor: Claude Code (modo autônomo)

## 1. Resumo Executivo
- Total de arquivos analisados
- Total de problemas encontrados
- Total de problemas corrigidos
- Problemas adiados (para o Implementation Guide)

## 2. Segurança
- Secrets expostos encontrados/removidos
- Middleware status
- RLS coverage
- Headers de segurança

## 3. Build Health
- pnpm build: pass/fail
- pnpm lint: errors/warnings
- tsc --noEmit: pass/fail
- Vitest: N/N passing

## 4. Domain Engine
- Bounded contexts: lista
- Events: lista com status
- Projectors: lista com status
- Boundary violations: lista

## 5. Intelligence Layer
- Engines: lista com status
- Testes: N/296 passando
- Problemas encontrados

## 6. Services Inventory
- Categoria A (real funcional): N de 41
- Categoria B (parcial): N de 41
- Categoria C (mock only): N de 41
- Tabela completa

## 7. Database
- Total de migrations
- Total de tabelas
- Tabelas sem RLS
- Foreign keys inconsistentes

## 8. Frontend
- Rotas totais
- Rotas funcionais
- Rotas quebradas (corrigidas)
- Componentes com problemas

## 9. Dual Event Store
- Status do Supabase adapter
- Status do Postgres adapter
- Funcionalidades em cada um
- Recomendação

## 10. Tech Debt Register
- Lista priorizada de tech debt restante
- Classificação: critical/high/medium/low
- Qual fase do Implementation Guide resolve cada item

## 11. Prontidão para Evolução
- Score geral: X/10
- Bloqueadores para BBOS Implementation Guide: lista
- Recomendação: GO / WAIT

Commit: "docs: CTO audit report complete"
```

---

## EXECUÇÃO

A ordem dos blocos é:

```
BLOCO 1  → Segurança (eliminar riscos imediatos)
BLOCO 2  → Build (garantir que compila)
BLOCO 3  → Domain Engine (coração do sistema)
BLOCO 4  → ML Engines (patrimônio de IA)
BLOCO 5  → Services + Migrations (backend)
BLOCO 6  → Frontend (UX)
BLOCO 7  → Contexts (state management)
BLOCO 8  → Event Store (documentar)
BLOCO 9  → Tests + CI/CD
BLOCO 10 → Performance
BLOCO 11 → Documentação + Report Final
```

Rode `pnpm build` e `npx vitest run` após CADA bloco.
Commite após CADA bloco.
NÃO pule blocos.
NÃO faça git push — o push será feito manualmente após revisão.

Ao terminar todos os 11 blocos, o CTO_AUDIT_REPORT.md deve ter o score
final e a recomendação GO/WAIT para iniciar o BBOS Implementation Guide v2.
