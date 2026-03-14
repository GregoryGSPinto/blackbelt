# Academy Operations Readiness

## Auditoria consolidada

### O que já existia e foi reaproveitado
- `memberships` + `academies` como base canônica de multi-tenancy e papéis.
- `content` como biblioteca canônica para vídeos e conteúdo pedagógico.
- `app/(admin)/usuarios/page.tsx` como superfície principal de operação de alunos.
- `app/(professor)/professor-videos/page.tsx` e `components/professor/*` como superfície principal de biblioteca de vídeos.
- `app/(main)/matricula/[academyId]/page.tsx` como ponto de entrada público para matrícula.

### O que existia, mas estava incompleto
- `/api/admin/usuarios` retornava lista vazia.
- `/api/professor/videos`, `/api/professor/videos/[id]` e `/api/professor/videos/upload` eram placeholders.
- `/matricula/[academyId]` era mockada e não associava o aluno à academia correta.
- `/minha-academia` e `/equipe` tinham UI, mas operavam 100% em mock.

### O que foi criado
- `academy_onboarding_links` para link oficial por academia.
- `academy_onboarding_requests` para fila de cadastro/aprovação de alunos e professores.
- API pública `/api/academy-onboarding/[slug]`.
- APIs administrativas de onboarding e equipe.
- QR real escaneável para distribuição do cadastro da academia.

## Fluxos prontos

### Admin da academia
- Gera e regenera link oficial de cadastro.
- Ativa ou desativa o link.
- Alterna entre aprovação automática e manual.
- Visualiza QR da academia com download e share.
- Aprova ou rejeita cadastros pendentes.
- Convida professores e ativa/desativa professores existentes.
- Convite de professor converge para o mesmo link oficial da academia, preservando o papel `professor` na fila.

### Professor
- Usa a biblioteca de vídeos já existente com persistência real em `content`.
- Cria, edita e remove vídeos por URL do YouTube.
- Conteúdo fica restrito ao tenant da academia e ao criador quando aplicável.

### Aluno
- Entra pelo link ou QR da academia.
- Enxerga contexto visual da academia correta.
- Cria conta com associação correta ao tenant.
- Recebe resposta honesta de acesso imediato ou pendência de aprovação.

## Regras de permissão
- Apenas `owner` e `admin` gerenciam link, QR, fila de onboarding e equipe.
- `professor` gerencia apenas seus próprios vídeos quando não é admin da academia.
- Todos os fluxos novos usam `academy_id` como escopo obrigatório.
- A aprovação manual cria ou ativa `membership` apenas dentro da academia correspondente.

## Decisões ainda em aberto
- Upload binário de vídeo continua dependente da estratégia final de storage/transcoding.
- Convite de professor hoje entra como fila operacional; provisionamento automático completo depende da política final de conta/credenciais.
- E-mails transacionais de convite/aprovação ainda dependem do stack final de notificações.
