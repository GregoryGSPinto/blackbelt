# Configuração do Stripe para Produção

Guia objetivo para fechar o fluxo comercial real do BlackBelt em modo controlado.

## 1. Criar Conta Stripe

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Complete a verificação de identidade (KYC)
3. Configure sua conta bancária para receber pagamentos

## 2. Obter Chaves de API

1. Acesse [Dashboard Stripe > Developers > API Keys](https://dashboard.stripe.com/apikeys)
2. Copie as chaves **Live** (não use as de teste):
   - `Publishable key`: Começa com `pk_live_`
   - `Secret key`: Começa com `sk_live_`
3. Adicione ao `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

## 3. Configurar Webhook

1. Acesse [Dashboard Stripe > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. Configure:
   - **Endpoint URL**: `https://<host-oficial>/api/webhooks/stripe`
   - **Events to listen**:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Copie o **Signing secret** (começa com `whsec_`)
5. Adicione ao `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://<host-oficial>
```

### Testar Webhook Localmente

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 4. Criar Produtos e Preços

### Opção A: Via Dashboard

1. Acesse [Produtos](https://dashboard.stripe.com/products)
2. Crie 3 produtos:
   - **Starter** - R$ 197/mês
   - **Professional** - R$ 497/mês
   - **Enterprise** - R$ 997/mês
3. Crie os `price_id` mensais e anuais necessários
4. Configure os envs seguindo o padrão usado pelo backend:

```bash
STRIPE_PRICE_<PLAN_ID>_MONTHLY=price_...
STRIPE_PRICE_<PLAN_ID>_ANNUAL=price_...
```

Exemplos:

```bash
STRIPE_PRICE_START_MONTHLY=price_...
STRIPE_PRICE_START_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
```

## 5. Configurar Emails de Pagamento

1. Acesse [Configurações > Emails](https://dashboard.stripe.com/settings/emails)
2. Habilite emails para:
   - Recibo de pagamento
   - Falha no pagamento
   - Confirmação de assinatura

## 6. Validar Estruturalmente Antes do E2E

```bash
pnpm exec tsx scripts/validate-stripe-release.ts
```

Esse script confirma:

- webhook com verificação de assinatura
- persistência em `academy_subscriptions`
- persistência em `subscription_invoices`
- rota de conversão de trial ligada ao checkout Stripe
- ausência de referência às tabelas legadas `subscriptions`, `invoices` e `payments`

## 7. Testar Fluxo de Pagamento

```bash
# 1. Rodar em modo de produção local
NEXT_PUBLIC_USE_MOCK=false pnpm dev

# 2. iniciar um trial autenticado e converter via /api/trial/convert
# 3. concluir checkout
# 4. reenviar eventos pelo Stripe CLI para /api/webhooks/stripe
# 5. verificar academy_subscriptions + subscription_invoices
```

## 8. Verificação Pré-Deploy

Checklist antes de publicar:

- [ ] Chaves Live configuradas (não de teste)
- [ ] `NEXT_PUBLIC_APP_URL` aponta para o host comercial oficial
- [ ] Webhook configurado com URL de produção em `/api/webhooks/stripe`
- [ ] Produtos e preços criados com os envs `STRIPE_PRICE_*`
- [ ] Emails de pagamento configurados
- [ ] `pnpm exec tsx scripts/validate-stripe-release.ts` passou
- [ ] Trial convertido no tenant correto
- [ ] `invoice.paid`, `invoice.payment_failed` e `customer.subscription.deleted` atualizaram o tenant correto

## 9. Troubleshooting

### Webhook não está funcionando

```bash
# Verificar logs na Vercel
vercel logs --follow

# Verificar se o endpoint está acessível
curl -X POST https://<host-oficial>/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Pagamentos sendo recusados

1. Verifique se a conta Stripe está completa (KYC aprovado)
2. Confirme que não está usando chaves de teste
3. Verifique limites da conta em [Configurações > Limites](https://dashboard.stripe.com/settings/limits)

## Referências

- [Documentação Stripe](https://stripe.com/docs)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [PIX no Stripe](https://stripe.com/docs/payments/pix)
- [Testing Stripe](https://stripe.com/docs/testing)
