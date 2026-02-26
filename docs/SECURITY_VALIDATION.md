# ⚡ VALIDAÇÃO RÁPIDA - SEGURANÇA FRONT-END
## BLACKBELT

---

## 🎯 OBJETIVO

Validar que **ZERO código mock está no bundle de produção**.

---

## ✅ CHECKLIST RÁPIDO

### 1️⃣ Testar Desenvolvimento

```bash
# 1. Instalar dependências
pnpm add

# 2. Rodar em modo dev
pnpm dev

# 3. Acessar http://localhost:3000

# 4. Fazer login
Email: admin@blackbelt.com
Senha: blackbelt123

# 5. Verificar console
# Deve mostrar: localStorage com seed users
```

**Resultado esperado:**
✅ Login funciona  
✅ Seed users carregados  
✅ Mock ativo  

---

### 2️⃣ Testar Produção

```bash
# 1. Build de produção
NODE_ENV=production pnpm build

# 2. Iniciar produção
npm start

# 3. Acessar http://localhost:3000

# 4. Tentar login com credenciais mock
Email: admin@blackbelt.com
Senha: blackbelt123

# 5. Verificar comportamento
```

**Resultado esperado (sem backend):**
❌ Login FALHA (esperado - sem API)  
✅ Mock NÃO ativo  
✅ Tentativa de chamada API real  

**Resultado esperado (com NEXT_PUBLIC_API_URL):**
✅ Chama API real  
✅ Mock ignorado  

---

### 3️⃣ Analisar Bundle

```bash
# 1. Instalar analyzer
pnpm add --save-dev @next/bundle-analyzer cross-env

# 2. Adicionar script ao package.json
"scripts": {
  "analyze": "cross-env ANALYZE=true next build"
}

# 3. Executar análise
pnpm analyze

# 4. Verificar arquivos .mock.ts
# Buscar por "auth.service.mock"
# Buscar por "devSeedRegistry"
# Buscar por "admin@blackbelt.com"
```

**Resultado esperado:**
✅ `auth.service.mock.ts` NÃO aparece  
✅ Seed users NÃO aparecem  
✅ Bundle ~300KB menor  

---

### 4️⃣ Verificar Código Fonte

```bash
# 1. Build de produção
pnpm build

# 2. Buscar no bundle gerado
cd .next
grep -r "admin@blackbelt.com" .
grep -r "devSeedRegistry" .
grep -r "passwordHash" .
```

**Resultado esperado:**
✅ NADA encontrado  
✅ Seed users eliminados  
✅ Funções mock eliminadas  

---

## 🔍 VALIDAÇÃO DETALHADA

### Verificar Arquivos

```bash
# Arquivos que DEVEM existir
ls lib/api/auth.service.ts          # ✅ Deve existir
ls lib/api/auth.service.mock.ts     # ✅ Deve existir

# Conteúdo do serviço principal
cat lib/api/auth.service.ts | wc -l
# Deve ser ~95 linhas

# Conteúdo do mock
cat lib/api/auth.service.mock.ts | wc -l
# Deve ser ~450 linhas
```

### Verificar Conditional Import

```bash
# Ver o código do serviço
head -40 lib/api/auth.service.ts

# Deve conter:
# if (process.env.NODE_ENV === 'development' && ...)
#   import('./auth.service.mock')
```

### Verificar Headers de Segurança

```bash
# Todos os mocks devem ter header
head -10 lib/mockData.ts
head -10 lib/mockAdminData.ts
head -10 lib/mockKidsData.ts
head -10 lib/mockTeenData.ts
head -10 lib/mockShopData.ts

# Devem começar com:
# /**
#  * Mock Data — APENAS DESENVOLVIMENTO
#  * ⚠️ ATENÇÃO: ...
#  */
```

---

## 🚨 SINAIS DE PROBLEMA

### ❌ Mocks no Bundle de Produção

```bash
# Se encontrar estes no bundle:
grep -r "devSeedRegistry" .next/    # ❌ PROBLEMA
grep -r "USR_ADMIN_M" .next/        # ❌ PROBLEMA
grep -r "blackbelt123" .next/         # ❌ PROBLEMA
grep -r "auth.service.mock" .next/  # ❌ PROBLEMA
```

**Solução:**
1. Verificar `next.config.js`
2. Verificar que `NODE_ENV=production` está setado
3. Limpar build: `rm -rf .next && pnpm build`

### ❌ Login Mock em Produção

```bash
# Testar em produção
pnpm build && npm start

# Fazer login com credenciais mock
# Se funcionar: ❌ PROBLEMA - mock vazou
```

**Solução:**
1. Verificar conditional import em `auth.service.ts`
2. Verificar que não há import direto de `.mock.ts`
3. Rebuild completo

---

## 📊 MÉTRICAS ESPERADAS

### Tamanho do Bundle

```
ANTES da segurança:
├─ Total: ~2.8MB
├─ Pages: ~1.2MB
└─ Chunks: ~1.6MB

DEPOIS da segurança:
├─ Total: ~2.5MB (✅ -10.7%)
├─ Pages: ~1.1MB
└─ Chunks: ~1.4MB
```

### Linhas de Código

```
auth.service.ts:
├─ ANTES: 562 linhas
└─ DEPOIS: 95 linhas (✅ -83%)

auth.service.mock.ts:
└─ NOVO: 450 linhas (dev only)
```

---

## ✅ VALIDAÇÃO FINAL

```
□ pnpm add completo
□ pnpm dev funciona
□ Login mock funciona em dev
□ pnpm build sem erros
□ Bundle menor que antes
□ grep não encontra mocks no .next/
□ Login mock NÃO funciona em prod (sem API)
□ Headers de segurança em todos os mocks
```

---

## 🎯 RESULTADO ESPERADO

**Em DESENVOLVIMENTO:**
```
✅ Mocks ativos
✅ Seed users disponíveis
✅ Login: admin@blackbelt.com / blackbelt123
✅ Hot reload funcional
```

**Em PRODUÇÃO:**
```
✅ Mocks eliminados
✅ Seed users removidos
✅ Bundle otimizado
✅ API real usada (se configurada)
```

---

## 📞 TROUBLESHOOTING

### Problema: Mock não funciona em dev

**Verificar:**
```bash
# 1. NODE_ENV está correto?
echo $NODE_ENV  # Deve ser vazio ou 'development'

# 2. NEXT_PUBLIC_API_URL está vazio?
echo $NEXT_PUBLIC_API_URL  # Deve estar vazio para usar mock

# 3. Arquivo mock existe?
ls lib/api/auth.service.mock.ts
```

### Problema: Mock aparece em produção

**Verificar:**
```bash
# 1. Build limpo
rm -rf .next node_modules/.cache
pnpm build

# 2. NODE_ENV está production?
NODE_ENV=production pnpm build

# 3. Webpack config está correto?
cat next.config.js | grep -A 20 "webpack"
```

---

**⚡ Validação completa em 5 minutos!**

**Status:** ✅ PRONTO PARA PRODUÇÃO
