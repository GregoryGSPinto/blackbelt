# Configuração do Stripe para Produção

Guia completo para configurar o Stripe no BlackBelt para ambiente de produção.

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
   - **Endpoint URL**: `https://api.blackbelt.app/webhooks/stripe`
   - **Events to listen**:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Copie o **Signing secret** (começa com `whsec_`)
5. Adicione ao `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Testar Webhook Localmente

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/webhooks/stripe
```

## 4. Configurar PIX (Brasil)

> ⚠️ Requer conta Stripe Brasil

1. Acesse [Configurações > Métodos de pagamento](https://dashboard.stripe.com/settings/payment_methods)
2. Habilite **PIX**
3. Configure os dados da sua empresa
4. Adicione ao `.env.local`:

```bash
STRIPE_PIX_ENABLED=true
```

### Configuração Adicional para PIX

No código, o PIX já está configurado em `lib/payments/stripe-checkout.ts`:

```typescript
payment_method_types: ['card', 'pix'], // PIX para Brasil
```

## 5. Criar Produtos e Preços

### Opção A: Via Dashboard

1. Acesse [Produtos](https://dashboard.stripe.com/products)
2. Crie 3 produtos:
   - **Starter** - R$ 197/mês
   - **Professional** - R$ 497/mês
   - **Enterprise** - R$ 997/mês
3. Copie os `price_ids` para o código

### Opção B: Via Script (Recomendado)

```bash
npx tsx scripts/setup-stripe-products.ts
```

## 6. Configurar Emails de Pagamento

1. Acesse [Configurações > Emails](https://dashboard.stripe.com/settings/emails)
2. Habilite emails para:
   - Recibo de pagamento
   - Falha no pagamento
   - Confirmação de assinatura

## 7. Testar Fluxo de Pagamento

```bash
# 1. Rodar em modo de produção local
NEXT_PUBLIC_USE_MOCK=false pnpm dev

# 2. Acesse http://localhost:3000/landing
# 3. Clique em um plano e complete o checkout
# 4. Verifique se o webhook foi recebido
```

## 8. Verificação Pré-Deploy

Checklist antes de publicar:

- [ ] Chaves Live configuradas (não de teste)
- [ ] Webhook configurado com URL de produção
- [ ] PIX habilitado (se Brasil)
- [ ] Produtos e preços criados
- [ ] Emails de pagamento configurados
- [ ] Webhook testado em produção

## 9. Troubleshooting

### Webhook não está funcionando

```bash
# Verificar logs na Vercel
vercel logs --follow

# Verificar se o endpoint está acessível
curl -X POST https://api.blackbelt.app/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### PIX não aparece no checkout

1. Verifique se a conta Stripe é do Brasil
2. Confirme que `STRIPE_PIX_ENABLED=true`
3. Verifique se o valor é em BRL (reais)

### Pagamentos sendo recusados

1. Verifique se a conta Stripe está completa (KYC aprovado)
2. Confirme que não está usando chaves de teste
3. Verifique limites da conta em [Configurações > Limites](https://dashboard.stripe.com/settings/limits)

## Referências

- [Documentação Stripe](https://stripe.com/docs)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [PIX no Stripe](https://stripe.com/docs/payments/pix)
- [Testing Stripe](https://stripe.com/docs/testing)
