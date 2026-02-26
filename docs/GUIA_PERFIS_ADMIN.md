# 🔐 GUIA RÁPIDO - PERFIS ADMINISTRATIVOS PARA TESTE

## 🎯 PERFIS DISPONÍVEIS NO CADASTRO

A tela de cadastro agora possui **7 perfis** disponíveis para você testar todas as funcionalidades!

---

## 👥 PERFIS DISPONÍVEIS

### 1. 👤 **ALUNO ADULTO**
- **Acesso:** App de treino e conteúdo
- **Permissões:** 0/8
- **Redirecionamento:** `/inicio`
- **Campos:** Idade (16+), Graduação, Professor

### 2. 👶 **KIDS**
- **Acesso:** Conteúdo infantil
- **Permissões:** 0/8
- **Redirecionamento:** `/infantil`
- **Campos:** Idade (4-15), Graduação Kids, Dados do Responsável

### 3. 👨‍👩‍👧 **RESPONSÁVEL**
- **Acesso:** Acompanhar dependentes
- **Permissões:** 0/8
- **Redirecionamento:** `/responsavel`
- **Campos:** Apenas dados básicos

### 4. 👨‍🏫 **PROFESSOR**
- **Acesso:** Gerenciar turmas e alunos
- **Permissões:** 1/8 (Validar Check-in)
- **Redirecionamento:** `/dashboard`
- **Campos:** Graduação (Nível Máximo), Tempo de Experiência, Especialidade

### 5. 🏢 **GESTOR** ⭐
- **Acesso:** Gestão completa da unidade
- **Permissões:** 6/8
- **Redirecionamento:** `/dashboard`
- **Campos:** Academia/Unidade, Cargo
- **Permissões Concedidas:**
  - ✅ Validar Check-in
  - ✅ Bloquear Aluno
  - ✅ Editar Turmas
  - ✅ Acessar Financeiro
  - ✅ Editar Pagamentos
  - ✅ Ver Relatórios

### 6. 🛠️ **ADMINISTRADOR** ⭐⭐
- **Acesso:** Administração do sistema
- **Permissões:** 8/8 (TODAS)
- **Redirecionamento:** `/dashboard`
- **Campos:** Academia/Unidade, Cargo
- **Permissões Concedidas:**
  - ✅ Validar Check-in
  - ✅ Bloquear Aluno
  - ✅ Editar Turmas
  - ✅ Acessar Financeiro
  - ✅ Editar Pagamentos
  - ✅ Ver Relatórios
  - ✅ Gerenciar Usuários
  - ✅ Acessar Configurações

### 7. ⚡ **SUPER ADMIN** ⭐⭐⭐
- **Acesso:** Acesso global irrestrito
- **Permissões:** 8/8 (TODAS)
- **Redirecionamento:** `/dashboard`
- **Campos:** Organização, Nível de Acesso
- **Permissões:** Controle total sobre tudo!

---

## 🎮 COMO TESTAR

### **Cenário 1: Criar Administrador para Teste Completo**

1. Acesse: `http://localhost:3000/cadastro`
2. Clique no card **🛠️ Administrador**
3. Clique em "Continuar"
4. Preencha os dados:
   ```
   Nome: Seu Nome
   Email: admin@teste.com
   Telefone: (11) 98765-4321
   Unidade: BLACKBELT - Teste
   Cargo: Administrador Geral
   Senha: 123456
   Confirmar Senha: 123456
   ```
5. Clique em "Criar Conta"
6. Será redirecionado para `/selecionar-perfil`
7. Seu perfil de Administrador estará ativo
8. Acesse `/dashboard` para ver o painel completo

### **Cenário 2: Criar Gestor**

1. Acesse: `http://localhost:3000/cadastro`
2. Clique no card **🏢 Gestor**
3. Preencha os dados e crie a conta
4. Terá acesso a 6 das 8 permissões

### **Cenário 3: Criar Super Admin**

1. Acesse: `http://localhost:3000/cadastro`
2. Clique no card **⚡ Super Admin**
3. Preencha os dados e crie a conta
4. Terá controle total do sistema

---

## 🔍 VERIFICAR PERMISSÕES

Após criar qualquer conta administrativa:

1. Acesse: `http://localhost:3000/permissoes-usuario`
2. Veja todas as permissões concedidas ao seu perfil
3. Lista completa com status (Concedida/Não Concedida)
4. Progress bar mostrando X de 8 permissões

---

## 🎯 FUNCIONALIDADES PARA TESTAR

### **Com Perfil ADMINISTRADOR:**

✅ **Dashboard** (`/dashboard`)
- Ver estatísticas completas
- Acesso total

✅ **Usuários** (`/usuarios`)
- Ver lista de todos os usuários
- Editar usuários
- Bloquear/Desbloquear alunos

✅ **Check-in** (`/check-in`)
- Validar presença de alunos
- Ver histórico completo

✅ **Turmas** (`/turmas`)
- Ver todas as turmas
- Editar turmas

✅ **Financeiro** (`/financeiro`)
- Ver alunos em atraso
- Ver alunos bloqueados
- Validar pagamentos

✅ **Alertas** (`/alertas`)
- Ver todos os alertas operacionais
- Filtrar por prioridade

✅ **Permissões** (`/permissoes`)
- Ver matriz completa de permissões

✅ **Configurações** (`/configuracoes`)
- Alterar configurações da unidade
- Configurar políticas de inadimplência

---

## 📊 MATRIZ COMPLETA DE PERMISSÕES

| Permissão | Aluno | Kids | Resp. | Prof. | Gestor | Admin | S.Admin |
|-----------|-------|------|-------|-------|--------|-------|---------|
| Validar Check-in | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Bloquear Aluno | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Editar Turmas | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Acessar Financeiro | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Editar Pagamentos | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Ver Relatórios | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Acessar Config. | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 🎨 CORES DOS PERFIS

```css
Aluno Adulto    → Azul       (from-blue-600 to-blue-800)
Kids            → Rosa       (from-pink-600 to-pink-800)
Responsável     → Verde      (from-green-600 to-green-800)
Professor       → Índigo     (from-indigo-600 to-indigo-800)
Gestor          → Roxo       (from-purple-600 to-purple-800)
Administrador   → Laranja    (from-orange-600 to-orange-800)
Super Admin     → Vermelho   (from-red-600 to-red-800)
```

---

## ✨ DESTAQUES VISUAIS

### **No Cadastro:**
- Cada perfil tem um card colorido com gradiente
- Ícone emoji distintivo
- Descrição clara do que cada perfil faz
- CheckCircle aparece quando selecionado

### **Nos Dados:**
- Campos condicionais aparecem baseado no perfil
- Alertas coloridos explicando as permissões
- Seções com títulos claros

### **Exemplos de Alertas:**

**GESTOR (Roxo):**
> "**Permissões do Gestor:** Validar check-in, Bloquear aluno, Editar turmas, Acessar financeiro, Editar pagamentos e Ver relatórios."

**ADMINISTRADOR (Laranja):**
> "**Acesso Total:** Como administrador, você terá acesso completo a todas as funcionalidades do sistema, incluindo gerenciamento de usuários e configurações avançadas."

**SUPER ADMIN (Vermelho):**
> "⚡ **Acesso Irrestrito ao Sistema**
> Super Admins possuem controle total sobre todas as unidades, usuários, configurações e dados do sistema. Use com responsabilidade."

---

## 🔄 FLUXO COMPLETO DE TESTE

### **1. Criar Conta Administrativa**
```
/cadastro → Selecionar ADMINISTRADOR → Preencher dados → Criar Conta
```

### **2. Seleção de Perfil**
```
/selecionar-perfil → Card do Administrador aparece → Selecionar → Continuar
```

### **3. Acessar Dashboard**
```
Redirecionado para /dashboard automaticamente
```

### **4. Testar Funcionalidades**
```
- Dashboard: Ver estatísticas
- Usuários: Gerenciar alunos
- Check-in: Validar presença
- Financeiro: Ver inadimplentes
- Configurações: Alterar regras
```

### **5. Ver Permissões**
```
/permissoes-usuario → Ver lista completa → 8/8 permissões concedidas
```

---

## 🎯 RECOMENDAÇÃO

**Para teste completo das funcionalidades:**
1. Crie uma conta como **ADMINISTRADOR** ou **SUPER ADMIN**
2. Isso dará acesso a todas as 10 páginas do painel administrativo
3. Você poderá testar:
   - ✅ Validações de check-in
   - ✅ Bloqueio de alunos
   - ✅ Edição de turmas
   - ✅ Visualização financeira
   - ✅ Gerenciamento de usuários
   - ✅ Alteração de configurações
   - ✅ Todos os componentes enterprise

**Para comparação de perfis:**
1. Crie também uma conta como **PROFESSOR**
2. Veja como o acesso é limitado
3. Compare as permissões em `/permissoes-usuario`
4. Note os botões desabilitados com tooltips

---

## 📱 INTERFACE NO HEADER

Após login, o **ProfileIndicator** no header mostrará:

**Desktop:**
- Avatar com gradiente e ícone
- Nome do usuário
- Tipo de perfil
- Dropdown ao clicar

**Dropdown Menu:**
- Informações completas do perfil
- Graduação (se aplicável)
- Academia vinculada
- Atalhos: Meu Perfil, Minhas Permissões
- Botão de Sair

---

## 🎉 PRONTO PARA TESTAR!

Agora você tem **7 perfis diferentes** para criar e testar todas as funcionalidades do sistema!

**Recomendo criar:**
1. **1 conta ADMINISTRADOR** (para teste completo)
2. **1 conta PROFESSOR** (para ver limitações)
3. **1 conta ALUNO** (para ver o app de treino)

Isso te dará uma visão completa de como o sistema funciona para cada tipo de usuário!

---

**Desenvolvido com ❤️ para o BLACKBELT**

*Sistema Multi-Perfil Enterprise v2.0*
