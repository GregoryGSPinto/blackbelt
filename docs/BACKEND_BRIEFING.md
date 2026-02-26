# BLACKBELT — BACKEND HANDOFF
### Briefing Técnico | Front-End → Backend

**Data:** 15/02/2026
**Status front:** 100% completo (446 arquivos, 6 perfis, mock-ready)
**O que falta:** Backend implementar endpoints reais + infra

---

## 1. EXECUTAR ESTES SCRIPTS (nesta ordem)

| Ordem | Arquivo | O que faz | Validação |
|-------|---------|-----------|-----------|
| 1º | `lib/security/sql/002_rls_production.sql` (534 linhas) | Cria RLS em 11 tabelas, 4 policies por tabela, funções current_unit_id() e current_app_role(), indexes unit_id | `SELECT count(*) FROM pg_policies WHERE policyname LIKE 'tenant_%'` → ≥ 20 |
| 2º | `lib/security/sql/003_rls_validation.sql` (264 linhas) | 12 testes automatizados (cross-unit bloqueado, default-deny, injection blocked) | Todos os testes imprimem PASS |
| 3º | `lib/security/sql/004_pg_hardening.sql` (270 linhas) | statement_timeout, connection limits por role, encrypt_pii/decrypt_pii, audit trigger | `SHOW statement_timeout` → valor configurado |
| 4º | `scripts/backup-restore-test.sh` (504 linhas) | Testa backup e restore completo no RDS (7 fases automatizadas) | Exit code 0, report JSON gerado |
| 5º | `scripts/backup-integrity-check.sql` (240 linhas) | 15 checks de integridade pós-restore | 15/15 PASS |
| 6º | `scripts/stress-test-production.js` (789 linhas) | 11 cenários de carga, 500 req/cenário, error < 1%, zero tenant leaks | Exit code 0, veredito APPROVED |

---

## 2. CONTRATOS DE API

O front consome via `lib/api/client.ts` (HTTP client centralizado). Token em memória, refresh via httpOnly cookie, retry automático em 5xx, timeout 30s, CSRF support.

### 2.1 Auth (lib/api/auth.service.ts)

```
POST /auth/login            { email, password, fingerprint? }  → { accessToken, user }
POST /auth/register         { nome, email, senha, cpf, ... }   → { accessToken, user }
POST /auth/refresh          (cookie httpOnly)                   → { accessToken }
POST /auth/logout           (cookie httpOnly)                   → 204
POST /auth/logout-all       (cookie httpOnly)                   → 204
POST /auth/check-email      { email }                           → { available: boolean }
POST /auth/reauth           { password }                        → { stepUpToken }
POST /auth/change-password  { current, newPassword }            → 204 (invalida todos tokens)
```

**Access token:** 15min TTL, Bearer header.
**Refresh token:** 7 dias TTL, httpOnly cookie, rotation obrigatória.
**JWT:** RSA ou EC256 em produção (não HS256). Payload mínimo: `{ sub, role, unit_id, iat, exp }`.

### 2.2 Admin (lib/api/admin.service.ts)

```
GET  /admin/dashboard/stats                    → EstatisticasDashboard
GET  /admin/usuarios                           → Usuario[]
GET  /admin/usuarios/:id                       → Usuario
GET  /admin/turmas                             → Turma[]
GET  /admin/turmas/:id                         → Turma
GET  /admin/turmas/:id/alunos                  → Usuario[]
GET  /admin/checkins                           → CheckIn[]
GET  /admin/alertas                            → Alerta[]
GET  /admin/historico-status                   → HistoricoStatus[]
GET  /admin/permissoes                         → Permissao[]
GET  /admin/perfil-permissoes                  → PerfilPermissoes[]
GET  /admin/perfis                             → PerfilInfo[]
```

**Todas as queries filtradas por RLS** (unit_id do JWT). Admin vê toda a unidade.

### 2.3 Content / Streaming (lib/api/content.service.ts)

```
GET /content/videos?category=X&level=Y&search=Z  → Video[]
GET /content/videos/:id                           → Video
GET /content/videos/:id/related?limit=N           → Video[]
GET /content/series                               → Serie[]
GET /content/top10                                → Video[]
```

### 2.4 Professor (lib/api/professor.service.ts + professor-pedagogico.service.ts)

```
GET  /professor/dashboard                             → ProfessorDashboard
GET  /professor/turmas                                → TurmaResumo[]
GET  /professor/avaliacoes                            → AvaliacaoPendente[]
GET  /professor/videos                                → VideoRecente[]
GET  /professor/alunos-progresso                      → AlunoProgresso[]
GET  /professor/atividades                            → AtividadeRecente[]

GET  /professor/pedagogico/alunos?page=&limit=&categoria=&search=  → Paginated<Aluno>
GET  /professor/pedagogico/alunos/:id                              → AlunoDetalhe
GET  /professor/pedagogico/estatisticas                            → EstatisticasPedagogicas
GET  /professor/pedagogico/logs?alunoId=X                          → LogPedagogico[]

POST /professor/pedagogico/alunos/:id/observacao    { texto }                    → WriteResult
POST /professor/pedagogico/alunos/:id/avaliacao     { nota, comentario, ... }    → WriteResult
POST /professor/pedagogico/alunos/:id/conquista       { tipo, descricao }          → WriteResult
PUT  /professor/pedagogico/alunos/:id/progresso     { nivel, subníveis } + If-Match  → WriteResult

DELETE /professor/pedagogico/sessões/:id              (soft delete)                → WriteResult
```

**PUT /progresso usa optimistic locking:** front envia header `If-Match: <etag>`. Se outdated → 409 Conflict.
**DELETE é soft delete:** marca `deleted_at`, não remove. FK RESTRICT em classes.

### 2.5 Kids (lib/api/kids.service.ts)

```
GET /kids/profiles?parentId=X    → KidProfile[]
GET /kids/profile?userId=X       → KidProfile
GET /kids/teens?parentId=X       → TeenProfile[]
GET /kids/parents                → ParentProfile[]
GET /kids/challenges             → KidsChallenge[]
GET /kids/medals                 → KidsMedal[]
GET /kids/mascots                → KidsMascot[]
GET /kids/checkins?kidId=X       → KidsCheckin[]
```

**Art. 14 LGPD:** dados de menores acessíveis apenas por responsável vinculado, professor e admin da unidade.

### 2.6 Teen (lib/api/teen.service.ts)

```
GET /teen/profiles?responsavelId=X  → TeenProfile[]
GET /teen/sessões?faixa=X             → TeenAula[]
GET /teen/conquistas                → TeenConquista[]
GET /teen/checkins                  → TeenCheckin[]
```

### 2.7 Shop (lib/api/shop.service.ts)

```
GET /shop/products                  → Product[]
GET /shop/products/:id              → Product
GET /shop/products?filter=new       → Product[]
GET /shop/products?filter=bestsellers → Product[]
GET /shop/products/featured         → Product
GET /shop/size-guide?kids=boolean   → SizeGuideTable[]
```

**E-commerce de produtos físicos.** Pagamento via processador PCI-DSS externo. Sem IAP.

### 2.8 LGPD (lib/persistence/lgpd.ts)

```
POST  /lgpd/requests                    { type: 'EXCLUSION'|'EXPORT'|'ANONYMIZATION', userId, reason? }
GET   /lgpd/requests?status=&page=      → LGPDRequest[] (admin only)
PATCH /lgpd/requests/:id/approve        (admin only) → LGPDRequest
POST  /lgpd/anonymize/:studentId        (admin + reauth) → 204
POST  /lgpd/export/:userId              → { downloadUrl }
```

---

## 3. MIDDLEWARE RLS (como o front espera que funcione)

O front envia JWT em toda request. O backend deve, em cada request:

```
BEGIN;
  SET LOCAL app.current_unit = '<unit_id do JWT>';
  SET LOCAL app.current_role = '<role do JWT>';
  -- executar query (RLS filtra automaticamente)
COMMIT; -- SET LOCAL reseta automaticamente
```

Implementação de referência: `lib/security/rls-middleware.ts` (372 linhas).

**Teste de validação:** `SELECT * FROM students` sem SET → 0 rows (default-deny).

---

## 4. VARIÁVEIS DE AMBIENTE

```env
# Obrigatórias
JWT_SECRET=             # RSA private key (PEM) ou EC256
JWT_PUBLIC_KEY=         # RSA public key (para validação)
ENCRYPTION_KEY=         # AES-256 key (hex, 64 chars) para PII no PostgreSQL
DATABASE_URL=           # postgresql://user:pass@host:5432/blackbelt?sslmode=require

# Recomendadas
SENTRY_DSN=             # Crash reporting (server-side)
FCM_SERVER_KEY=         # Firebase Cloud Messaging (push)
SIEM_ENDPOINT=          # SIEM integration
SIEM_API_KEY=           # SIEM auth

# Front fornece
NEXT_PUBLIC_API_URL=    # URL base da API (ex: https://api.blackbelt.com.br)
NEXT_PUBLIC_SENTRY_DSN= # Crash reporting (client-side)
```

**Todas via AWS Secrets Manager, Azure Key Vault, ou Doppler. NUNCA em código ou .env commitado.**

---

## 5. CRITÉRIOS DE GO-LIVE

O front **não sobe para as stores** sem estes 5 itens validados:

| # | Critério | Como validar | Gate |
|---|----------|-------------|------|
| 1 | **JWT server-side** (RSA/EC256) | `openssl ec -in key.pem -check` ou `openssl rsa` | Signature válida em jwt.io |
| 2 | **RLS ativo** | `SELECT * FROM students` sem SET app.current_unit | 0 rows |
| 3 | **Backup testado** | `bash scripts/backup-restore-test.sh` | Exit 0 + 15/15 integrity checks |
| 4 | **HTTPS + HSTS** | `curl -I https://api.blackbelt.com.br` | HSTS header presente, TLS 1.2+ |
| 5 | **Rate limiting** | 200 POST /auth/login do mesmo IP em 60s | ≥ 150 respostas 429 |

---

## 6. TIPOS (TypeScript)

Todos os tipos que o front consome estão em `lib/api/contracts.ts`. Os principais:

```
TipoPerfil = 'ADMIN' | 'SUPER_ADMIN' | 'INSTRUTOR' | 'ALUNO' | 'TEEN' | 'KID' | 'PARENT'
StatusOperacional = 'ATIVO' | 'EM_ATRASO' | 'BLOQUEADO'
Categoria = 'ADULTO' | 'KIDS'
CategoriaRegistro = 'Kids' | 'Adolescente' | 'Adulto'

User { id, nome, email, tipo, perfil, unit_id, avatar?, ... }
Academy { id, nome, endereco, horarios, configuracao, plano, ... }
Class { id, nome, professor, horario, categoria, status, ... }
CheckIn { id, aluno, turma, data, status, ... }
Payment { id, aluno, valor, status, metodo, vencimento, ... }
```

**O arquivo `contracts.ts` é o contrato.** Se o backend retornar esses shapes, o front funciona sem alteração.

---

## 7. DOCUMENTAÇÃO COMPLEMENTAR

| Documento | O que contém |
|-----------|-------------|
| `backend-handoff.docx` (26 KB) | 7 go-live gates, 37 controles detalhados, roadmap completo |
| `go-live-checklist.docx` (25 KB) | 39 controles com status, 12 ações obrigatórias |
| `isms-certification-pack.docx` (32 KB) | ISMS completo para ISO 27001 |
| `backup-restore-report.docx` (19 KB) | Template preenchível pós-teste de restore |
| `store-checklist.docx` (24 KB) | 28 requisitos App Store + Play Store |

**Todos no ZIP entregue.**
