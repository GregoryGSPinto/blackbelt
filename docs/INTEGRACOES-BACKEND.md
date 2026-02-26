# 📋 INTEGRAÇÃO BACKEND — BlackBelt
## Documentação para Time Backend

---

## 1. Gateway de Pagamento

### Service: `lib/api/gateway.service.ts`

### Endpoints Necessários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/gateway/cobrancas` | Criar cobrança (PIX, boleto, cartão) |
| GET | `/api/gateway/cobrancas/:id` | Consultar status de cobrança |
| DELETE | `/api/gateway/cobrancas/:id` | Cancelar cobrança |
| POST | `/api/gateway/recorrencias` | Configurar cobrança recorrente |
| DELETE | `/api/gateway/recorrencias/:id` | Cancelar recorrência |
| GET | `/api/gateway/webhooks` | Listar webhooks recebidos |
| POST | `/api/gateway/webhook-receiver` | Receiver de webhooks do provedor |

### Fluxo: Pagamento PIX
```
1. Frontend chama POST /gateway/cobrancas { metodo: 'pix', valor, alunoId }
2. Backend cria cobrança no provedor (Asaas/Pagarme)
3. Backend retorna { pixQrCodeBase64, pixCopiaCola, id }
4. Frontend exibe QR Code ao aluno
5. Aluno paga via app do banco
6. Provedor envia webhook → POST /gateway/webhook-receiver
7. Backend atualiza status da cobrança
8. Backend atualiza StatusOperacional do aluno se necessário (ATIVO/EM_ATRASO)
```

### Fluxo: Webhook de Confirmação
```
1. Provedor envia POST /gateway/webhook-receiver { event: 'payment.confirmed', id }
2. Backend valida assinatura do webhook (HMAC)
3. Backend atualiza Cobranca.status → 'pago'
4. Backend verifica se aluno estava EM_ATRASO/BLOQUEADO
5. Se sim, atualiza StatusOperacional → 'ATIVO'
6. Backend dispara push notification ao aluno: "Pagamento confirmado!"
```

### Variáveis de Ambiente
```env
GATEWAY_PROVIDER=asaas          # asaas | pagarme | stripe
GATEWAY_API_KEY=xxx
GATEWAY_WEBHOOK_SECRET=xxx
GATEWAY_SANDBOX=true
```

### Provedores Recomendados (Brasil)
- **Asaas**: Melhor para PIX + boleto, popular em unidades
- **Pagarme**: Mais flexível, boa API
- **Stripe**: Global, bom para cartão recorrente

---

## 2. WhatsApp Business API

### Service: `lib/api/whatsapp-business.service.ts`

### Endpoints Necessários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/whatsapp/enviar` | Enviar mensagem individual |
| POST | `/api/whatsapp/enviar-lote` | Enviar em lote |
| GET | `/api/whatsapp/status/:id` | Consultar status de entrega |
| GET | `/api/whatsapp/stats` | Estatísticas de envio |
| POST | `/api/whatsapp/webhook-receiver` | Receiver de status updates |

### Templates Cadastrados no WhatsApp Business
Os templates precisam ser aprovados pela Meta antes de enviar:

| ID | Nome | Categoria | Variáveis |
|----|------|-----------|-----------|
| `wpp-cobranca` | Cobrança amigável | UTILITY | nome, mes, data_vencimento, valor |
| `wpp-convite-trial` | Convite sessão experimental | MARKETING | nome, endereco, horarios |
| `wpp-followup-trial` | Follow-up pós-trial | MARKETING | nome, valor_mensal, valor_trimestral |
| `wpp-evento` | Convite para evento | MARKETING | nome, nome_evento, data, local, valor |
| `wpp-reativacao` | Reativação de inativo | MARKETING | nome |
| `wpp-aniversario` | Parabéns aniversário | MARKETING | nome |

### Fluxo: Automação → WhatsApp
```
1. Automação disparada (ex: AUSENCIA_3_DIAS)
2. Backend identifica alunos que atendem ao trigger
3. Backend chama WhatsApp Business API com template + variáveis
4. Meta processa e envia ao aluno
5. Webhook de status: enviado → entregue → lido
```

### Variáveis de Ambiente
```env
WHATSAPP_PROVIDER=meta           # meta | 360dialog | twilio
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=xxx
```

---

## 3. Push Notifications (Firebase Cloud Messaging)

### Service: `lib/api/push.service.ts`

### Endpoints Necessários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/push/enviar` | Enviar push para lista de userIds |
| POST | `/api/push/topico` | Enviar para tópico |
| POST | `/api/push/tokens` | Registrar FCM token |
| DELETE | `/api/push/tokens/:userId` | Desregistrar token |

### Setup Necessário
1. Criar projeto Firebase Console
2. Gerar `firebase-adminsdk.json` (service account)
3. Configurar `public/firebase-messaging-sw.js` (service worker)
4. Registrar token FCM no login/app load

### Fluxo: Registro + Envio
```
1. Aluno abre o app → solicitarPermissao()
2. Se concedida → firebase.messaging().getToken()
3. Frontend envia token → POST /push/tokens { userId, fcmToken, platform }
4. Backend armazena token
5. Quando enviar push → POST /push/enviar { titulo, corpo, destinatarios }
6. Backend busca tokens dos destinatários
7. Backend chama firebase-admin.messaging().sendMulticast()
```

### Variáveis de Ambiente
```env
FIREBASE_PROJECT_ID=blackbelt
FIREBASE_SERVICE_ACCOUNT=./firebase-adminsdk.json
FIREBASE_VAPID_KEY=xxx              # Para web push
```

---

## 4. Cloud Storage

### Service: `lib/api/storage.service.ts`

### Endpoints Necessários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/storage/upload` | Upload direto (multipart/form-data) |
| POST | `/api/storage/presigned-url` | Gerar presigned URL para upload direto |
| GET | `/api/storage/url?key=xxx` | Obter URL pública/assinada de arquivo |
| DELETE | `/api/storage/files?key=xxx` | Deletar arquivo |
| GET | `/api/storage/stats` | Estatísticas de uso |

### Buckets e Limites

| Bucket | Max/Arquivo | Tipos Aceitos | Uso |
|--------|:-----------:|---------------|-----|
| `atestados` | 10 MB | PDF, JPG, PNG | Atestados médicos dos alunos |
| `videos` | 500 MB | MP4, WebM, MOV | Vídeos de sessões e técnicas |
| `avatares` | 5 MB | JPG, PNG, WebP | Fotos de perfil |
| `documentos` | 20 MB | PDF, JPG, PNG | Termos assinados, contratos |
| `temp` | 50 MB | Qualquer | Uploads temporários |

### Fluxo: Upload de Atestado Médico
```
1. Aluno seleciona arquivo no app
2. Frontend valida tipo/tamanho (validarArquivo())
3. Frontend chama POST /storage/presigned-url { bucket: 'atestados', ... }
4. Backend gera presigned URL no S3/GCS
5. Frontend faz PUT direto no presigned URL (sem passar pelo backend)
6. Frontend confirma upload e atualiza PerfilEstendido.atestadoMedico
7. Admin revisa atestado → status: 'aprovado' | 'rejeitado'
```

### Variáveis de Ambiente
```env
STORAGE_PROVIDER=s3              # s3 | gcs | r2
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=blackbelt-files
AWS_S3_REGION=sa-east-1
```

### Provedores Recomendados
- **AWS S3**: Mais popular, sa-east-1 (São Paulo)
- **Cloudflare R2**: Sem egress fees, compatível S3
- **GCP Cloud Storage**: Boa integração com Firebase

---

## 5. Mapeamento de ENV Vars Completo

```env
# ── App ──
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=https://api.blackbelt.com.br

# ── Gateway de Pagamento ──
GATEWAY_PROVIDER=asaas
GATEWAY_API_KEY=
GATEWAY_WEBHOOK_SECRET=
GATEWAY_SANDBOX=true

# ── WhatsApp Business ──
WHATSAPP_PROVIDER=meta
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# ── Firebase / Push ──
FIREBASE_PROJECT_ID=
FIREBASE_VAPID_KEY=
NEXT_PUBLIC_FIREBASE_CONFIG=

# ── Cloud Storage ──
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=sa-east-1

# ── Segurança ──
JWT_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=
```

---

## 6. Ordem de Implementação Recomendada

1. **Cloud Storage** → Desbloqueia upload de atestados e avatares
2. **Gateway Pagamento** → Core do negócio (cobrança)
3. **Push Notifications** → Engajamento em tempo real
4. **WhatsApp Business** → Automações de retenção
