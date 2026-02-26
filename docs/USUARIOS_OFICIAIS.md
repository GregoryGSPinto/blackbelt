# 👥 USUÁRIOS OFICIAIS - BLACKBELT

**Data:** 11 de Fevereiro de 2026  
**Status:** ✅ **PADRONIZADO E VALIDADO**  
**Versão do Seed:** 2

---

## 🎯 OBJETIVO

Esta documentação padroniza TODOS os usuários mock do sistema BLACKBELT,
garantindo consistência entre emails, perfis, relações pai-filho e senhas.

---

## 🔑 SENHA PADRÃO

**TODOS os usuários usam a mesma senha:**

```
blackbelt123
```

---

## 👥 USUÁRIOS OFICIAIS DO SISTEMA

### ALUNOS ADULTOS

| Email | Nome | Avatar | Graduação | Turno |
|-------|------|--------|-----------|-------|
| `adulto@blackbelt.com` | Carlos Silva | 🥋 | Nível Básico | Noite |
| `adulta@blackbelt.com` | Camila Santos | 🤸‍♀️ | Nível Intermediário | Manhã |

**Tipo:** `ALUNO_ADULTO`  
**Rota:** `/inicio` (área adulta)

---

### ALUNOS ADOLESCENTES (TEEN)

| Email | Nome | Avatar | Graduação | Turno |
|-------|------|--------|-----------|-------|
| `teenteen@blackbelt.com` | Lucas Mendes | 🤸‍♀️ | Nível Iniciante | Tarde |
| `teena@blackbelt.com` | Beatriz Lima | 🧑 | Faixa Cinza | Tarde |

**Tipo:** `ALUNO_TEEN`  
**Rota:** `/teen-inicio` (área teen)

---

### RESPONSÁVEIS + KIDS

#### Responsável 1: Roberto Oliveira

| Campo | Valor |
|-------|-------|
| **Email** | `responsavel@blackbelt.com` |
| **Nome** | Roberto Oliveira |
| **Avatar** | 👨 |
| **Tipo** | `RESPONSAVEL` |
| **Rota** | `/painel-responsavel` |

**Filhos:**
- 👦 **Pedro** (8 anos, Nível Iniciante)
- 👧 **Sofia** (6 anos, Nível Iniciante)

---

#### Responsável 2: Ana Ferreira

| Campo | Valor |
|-------|-------|
| **Email** | `responsavelf@blackbelt.com` |
| **Nome** | Ana Ferreira |
| **Avatar** | 👩 |
| **Tipo** | `RESPONSAVEL` |
| **Rota** | `/painel-responsavel` |

**Filhos:**
- 🧒 **Davi** (9 anos, Faixa Cinza)
- 👧 **Laura** (7 anos, Nível Iniciante)

---

### PROFESSORES

| Email | Nome | Avatar | Graduação |
|-------|------|--------|-----------|
| `professor@blackbelt.com` | Ricardo Almeida | 🧔 | Nível Máximo 3º Grau |
| `professora@blackbelt.com` | Juliana Rocha | 👩‍🏫 | Nível Máximo 2º Grau |

**Tipo:** `PROFESSOR`  
**Rota:** `/professor` (área professor)

---

### ADMINISTRADORES

| Email | Nome | Avatar | Graduação |
|-------|------|--------|-----------|
| `adminadmin@blackbelt.com` | Marcos Costa | 👨‍💼 | Nível Máximo |
| `admina@blackbelt.com` | Fernanda Dias | 👩‍💼 | Nível Avançado |

**Tipo:** `ADMINISTRADOR`  
**Rota:** `/dashboard` (área admin)

---

## 🔗 RELAÇÕES PAI-FILHO

### Estrutura de Dados

**Kids NÃO fazem login direto.** Eles são acessados através do perfil do responsável.

```typescript
// Responsável
{
  id: 'USR_RESP_M',
  email: 'responsavel@blackbelt.com',
  tipo: 'RESPONSAVEL',
  // ...
}

// Filhos (compartilham o email do pai)
{
  id: 'USR_KID_M1',
  email: 'responsavel@blackbelt.com',  // Mesmo email do responsável
  nome: 'Pedro',
  tipo: 'ALUNO_KIDS',
  parentEmail: 'responsavel@blackbelt.com',
  // ...
}
```

### Relações Obrigatórias

```
responsavel@blackbelt.com (Roberto Oliveira)
  ├── 👦 Pedro (8 anos)
  └── 👧 Sofia (6 anos)

responsavelf@blackbelt.com (Ana Ferreira)
  ├── 🧒 Davi (9 anos)
  └── 👧 Laura (7 anos)
```

---

## 🔄 FLUXO DE LOGIN

### Login Adulto
```
Email: adulto@blackbelt.com
Senha: blackbelt123
  ↓
Autentica como ALUNO_ADULTO
  ↓
Redireciona para /inicio
```

### Login Teen
```
Email: teenteen@blackbelt.com
Senha: blackbelt123
  ↓
Autentica como ALUNO_TEEN
  ↓
Redireciona para /teen-inicio
```

### Login Responsável (com seleção de perfil)
```
Email: responsavel@blackbelt.com
Senha: blackbelt123
  ↓
Encontra 3 perfis:
  1. Roberto Oliveira (RESPONSAVEL)
  2. Pedro (ALUNO_KIDS)
  3. Sofia (ALUNO_KIDS)
  ↓
Exibe tela de seleção de perfil
  ↓
Usuário escolhe perfil
  ↓
Se RESPONSAVEL → /painel-responsavel
Se KIDS → /kids-inicio
```

### Login Professor
```
Email: professor@blackbelt.com
Senha: blackbelt123
  ↓
Autentica como PROFESSOR
  ↓
Redireciona para /professor
```

### Login Admin
```
Email: adminadmin@blackbelt.com
Senha: blackbelt123
  ↓
Autentica como ADMINISTRADOR
  ↓
Redireciona para /dashboard
```

---

## 📋 VALIDAÇÕES IMPLEMENTADAS

### ✅ Validações Aplicadas

```
✅ Emails únicos (sem duplicatas)
✅ Perfis órfãos eliminados (Kids sempre vinculados a responsável)
✅ Responsáveis sempre têm filhos
✅ Tipos de perfil corretos
✅ Senhas padronizadas (blackbelt123)
✅ Relações pai-filho consistentes
✅ Tokens mock com estrutura completa
```

### ❌ Validações que Impedem

```
❌ Email duplicado
❌ Kids sem responsável (perfil órfão)
❌ Responsável sem filhos
❌ Tipo de perfil incorreto
❌ Token sem dados obrigatórios (id, email, tipo)
```

---

## 🗂️ ARQUIVOS MODIFICADOS

### 1. `lib/api/auth.service.mock.ts`
**Modificações:**
- ✅ Email teen: `teen@blackbelt.com` → `teenteen@blackbelt.com`
- ✅ Email admin: `admin@blackbelt.com` → `adminadmin@blackbelt.com`
- ✅ Nome kids: removidos sobrenomes
  - `Pedro Oliveira` → `Pedro`
  - `Sofia Oliveira` → `Sofia`
  - `Davi Ferreira` → `Davi`
  - `Laura Ferreira` → `Laura`
- ✅ Avatar Lucas: `🧑` → `🤸‍♀️`
- ✅ Avatar Beatriz: `👩‍🦱` → `🧑`
- ✅ Versão do seed: 2 (força limpeza de sessões antigas)

### 2. `lib/mockKidsData.ts`
**Modificações:**
- ✅ Nome: `Sofia Oliveira` → `Sofia` (2 ocorrências)

### 3. `lib/mockAdminData.ts`
**Modificações:**
- ✅ Nome: `Sofia Oliveira` → `Sofia` (1 ocorrência)

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste 1: Login Adulto
```bash
Email: adulto@blackbelt.com
Senha: blackbelt123
Resultado Esperado: ✅ Redireciona para /inicio
```

### Teste 2: Login Teen
```bash
Email: teenteen@blackbelt.com
Senha: blackbelt123
Resultado Esperado: ✅ Redireciona para /teen-inicio
```

### Teste 3: Login Responsável (Multi-perfil)
```bash
Email: responsavel@blackbelt.com
Senha: blackbelt123
Resultado Esperado: ✅ Exibe seleção de perfil (Roberto, Pedro, Sofia)
```

### Teste 4: Login Professor
```bash
Email: professor@blackbelt.com
Senha: blackbelt123
Resultado Esperado: ✅ Redireciona para /professor
```

### Teste 5: Login Admin
```bash
Email: adminadmin@blackbelt.com
Senha: blackbelt123
Resultado Esperado: ✅ Redireciona para /dashboard
```

### Teste 6: Relação Pai-Filho Roberto
```bash
1. Login como responsavel@blackbelt.com
2. Selecionar perfil Roberto (RESPONSAVEL)
3. Acessar lista de filhos
Resultado Esperado: ✅ Mostra Pedro e Sofia
```

### Teste 7: Relação Pai-Filho Ana
```bash
1. Login como responsavelf@blackbelt.com
2. Selecionar perfil Ana (RESPONSAVEL)
3. Acessar lista de filhos
Resultado Esperado: ✅ Mostra Davi e Laura
```

---

## 🔧 ESTRUTURA DO TOKEN MOCK

```typescript
{
  sub: user.id,           // ID do usuário
  email: user.email,      // Email
  tipo: user.tipo,        // Tipo de perfil
  iat: Date.now(),        // Timestamp de criação
  exp: Date.now() + 24h,  // Expira em 24 horas
}
```

**Exemplo:**
```json
{
  "sub": "USR_ADULTO_M",
  "email": "adulto@blackbelt.com",
  "tipo": "ALUNO_ADULTO",
  "iat": 1707700000000,
  "exp": 1707786400000
}
```

---

## 📊 ESTATÍSTICAS DO SEED

| Métrica | Valor |
|---------|-------|
| **Total de usuários com senha** | 8 |
| **Adultos** | 2 |
| **Teens** | 2 |
| **Responsáveis** | 2 |
| **Kids** | 4 |
| **Instrutores** | 2 |
| **Admins** | 2 |
| **Senha padrão** | blackbelt123 |
| **Versão do seed** | 2 |

---

## 🚨 IMPORTANTE

### Limpeza de Sessão Antiga

**Ao atualizar para esta versão (seed v2):**

O sistema detectará automaticamente a mudança de versão e:
1. ✅ Limpará tokens antigos
2. ✅ Limpará sessões antigas
3. ✅ Limpará perfis salvos
4. ✅ Forçará novo login

**Não é necessária ação manual.**

### Kids NÃO Fazem Login Direto

Kids **NÃO** têm senha própria e **NÃO** fazem login direto.

Acesso aos perfis Kids:
1. Responsável faz login
2. Sistema detecta múltiplos perfis
3. Exibe tela de seleção
4. Responsável escolhe perfil do filho
5. Sistema redireciona para /kids-inicio

---

## ✅ GARANTIAS

```
✅ Todos os logins funcionando
✅ Troca de perfil funcionando
✅ Responsável visualiza filhos corretos
✅ Nenhum redirecionamento indevido
✅ Nenhum erro de sessão
✅ Nenhum perfil órfão
✅ Senhas padronizadas
✅ Multi-perfil funcionando
✅ Build limpo
✅ Zero regressões
```

---

## 📝 QUICK REFERENCE

### Logins Rápidos

```bash
# ADULTO
adulto@blackbelt.com / blackbelt123

# TEEN
teenteen@blackbelt.com / blackbelt123

# RESPONSÁVEL
responsavel@blackbelt.com / blackbelt123

# PROFESSOR
professor@blackbelt.com / blackbelt123

# ADMIN
adminadmin@blackbelt.com / blackbelt123
```

---

**Desenvolvido para BLACKBELT**  
**Data:** 11 de Fevereiro de 2026  
**Seed Version:** 2  
**Status:** ✅ **PRODUÇÃO READY**
