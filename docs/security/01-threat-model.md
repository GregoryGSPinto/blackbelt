# Threat Model

## Superfícies prioritárias

- Autenticação via Supabase SSR
- Rotas `app/api/*` com privilégios administrativos
- Multi-tenancy por `memberships` / `academy_id`
- Fluxos de kids/teen/responsável
- Billing via Stripe
- Mobile wrapper com web assets exportados

## Vetores prováveis

- IDOR/BOLA em endpoints server-side com service role
- Vazamento de segredo por arquivos `.env*` locais
- Exposição de PII em logs
- Reviewer/demo accounts reutilizadas em produção
- Fluxos públicos de LGPD sem validação operacional
- Dependência excessiva de export estático em app com muitas rotas dinâmicas

## Controles existentes

- Cookies SSR do Supabase
- RLS em tabelas centrais
- CSP e headers de borda
- Testes automatizados razoáveis

## Controles pendentes

- Rate limit consistente em rotas críticas
- Redaction padronizada em todo o código
- Inventário completo de endpoints com service role
- Estratégia única de auth/token storage para web e mobile
