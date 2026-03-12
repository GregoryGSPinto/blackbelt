# DB Release Audit

Data da auditoria: 12 de março de 2026

## Resumo

- Base principal: Supabase Postgres
- Controles encontrados: RLS em tabelas centrais, migrations numeradas, funções edge separadas
- Risco principal: coexistência de migrations antigas, scripts de seed/demo e funções `SECURITY DEFINER`

## Achados relevantes

### Destrutividade localizada

- `supabase/migrations/00009_lgpd.sql`
  - `DELETE FROM notifications WHERE profile_id = _profile_id;`
  - contexto: anonimização LGPD
  - avaliação: aceitável para fluxo de exclusão, mas exige runbook e aprovação operacional

### Cascades com impacto em dados

- `data_export_requests.profile_id REFERENCES profiles(id) ON DELETE CASCADE`
- `data_deletion_requests.profile_id REFERENCES profiles(id) ON DELETE CASCADE`
- `lgpd_consent_log.profile_id REFERENCES profiles(id) ON DELETE CASCADE`
- impacto: apagar perfil elimina histórico administrativo desses pedidos

### Segurança de acesso

- RLS encontrado em `audit_log`, `lgpd_consent_log`, `data_export_requests`, `data_deletion_requests`
- risco residual:
  - diversos endpoints server-side usam service role/admin client
  - é necessário revisar endpoint por endpoint em rollout produtivo para evitar bypass indevido de tenancy

## Correções aplicadas nesta rodada

- Nenhuma migration destrutiva nova foi adicionada
- Fluxo público de exclusão passou a registrar solicitação em `data_deletion_requests` via backend controlado
- Decisão: não alterar schema em release candidate sem janela explícita de rollout

## Blockers de banco para submissão

- Falta plano operacional formal para execução/aprovação de exclusões LGPD
- Falta rollback documentado para migrations de pricing/billing
- Falta validação automatizada de isolamento multi-tenant por dados reais

## Rollout recomendado

1. Congelar novas migrations não essenciais.
2. Executar backup snapshot antes do deploy.
3. Aplicar migrations em staging espelhado.
4. Rodar smoke de auth, membership, billing, deletion request.
5. Publicar produção em janela controlada.

## Rollback recomendado

1. Bloquear tráfego de escrita.
2. Reverter aplicação para build anterior.
3. Restaurar backup apenas se houver corrupção funcional ou perda de dados.
4. Não executar rollback destrutivo de schema sem diff manual por tabela.

## Go/No-Go DB

- Beta fechado: GO com backup obrigatório
- Cliente piloto: GO com supervisão
- Play/App Store produção: NO-GO enquanto mobile build/export permanecer instável
