# 🥋 BLACKBELT - PAINEL ADMINISTRATIVO

## 📋 VISÃO GERAL

O Painel Administrativo do BLACKBELT é um sistema de gestão completo para unidades de treinamento especializado, focado em:

- **Controle Operacional**: Gestão de alunos, turmas e presenças
- **Inadimplência**: Sistema de status operacional (Ativo / Em Atraso / Bloqueado)
- **Check-in**: Validação de presença com regras de bloqueio
- **Organização**: Turmas, horários e agenda diária
- **Alertas**: Monitoramento proativo de eventos importantes

## 🎯 PÚBLICO-ALVO

- **Donos de Academia**
- **Gestores Operacionais**
- **Coordenadores Técnicos**
- **Instrutores** (acesso limitado)
- **Recepcionistas**
- **Administradores do Sistema**

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### 1️⃣ DASHBOARD PRINCIPAL (`/dashboard`)
- Visão geral com cards de estatísticas
- Total de alunos, ativos, em atraso e bloqueados
- Check-ins do dia
- Alertas operacionais em destaque
- Ações rápidas

### 2️⃣ GESTÃO DE USUÁRIOS (`/usuarios`)
- Listagem completa de alunos
- Filtros por status e categoria
- Busca por nome ou e-mail
- Visualização de detalhes do aluno
- Cards de estatísticas (Ativos / Em Atraso / Bloqueados)
- Ações: Editar, Ver Histórico, Alterar Status

### 3️⃣ CHECK-IN ADMINISTRATIVO (`/check-in`)
- Busca rápida de alunos
- Validação de check-in com regras de bloqueio
- Verificação de status operacional
- Histórico de check-ins do dia
- Indicadores visuais de presença
- Bloqueio automático para alunos inadimplentes

### 4️⃣ GESTÃO DE TURMAS (`/turmas`)
- Visualização de todas as turmas
- Informações de professor, horários e dias
- Indicador de ocupação (capacidade)
- Listagem de alunos por turma
- Status da turma (Ativa / Pausada)
- Detalhes completos ao clicar na turma

### 5️⃣ AGENDA DO DIA (`/agenda`)
- Timeline de turmas do dia
- Informações de horário, professor e sala
- Check-ins realizados por turma
- Taxa de presença em tempo real
- Visualização otimizada para coordenação

### 6️⃣ FINANCEIRO (`/financeiro`)
- Controle de status de pagamento (VISUAL)
- Listagem de alunos em atraso
- Listagem de alunos bloqueados
- Histórico de alterações de status
- Ações: Validar Pagamento, Bloquear, Desbloquear

**IMPORTANTE**: Este módulo é apenas VISUAL. Não processa pagamentos reais nem integra com gateways.

### 7️⃣ ALERTAS OPERACIONAIS (`/alertas`)
- Centro de notificações
- Filtro por prioridade (Alta / Média / Baixa)
- Tipos de alerta:
  - Bloqueio: Tentativa de check-in bloqueado
  - Atraso: Alunos com faltas consecutivas
  - Vencimento: Pagamentos vencendo
  - Frequência: Turmas com baixa presença

### 8️⃣ PERMISSÕES RBAC (`/permissoes`)
- 5 Perfis de Acesso:
  - Professor
  - Coordenador
  - Gestor
  - Administrador
  - Super Admin
- Visualização de permissões por perfil
- Controle visual de acesso

### 9️⃣ CONFIGURAÇÕES (`/configuracoes`)
- Políticas de inadimplência
- Limite de atraso permitido
- Dias para bloqueio automático
- Mensagem de bloqueio personalizada
- Horário de funcionamento
- Check-in antecipado

### 🔟 MODO RECEPÇÃO (`/recepcao`)
- Interface simplificada para tablets/PCs
- Busca rápida de alunos
- Check-in com 1 clique
- Feedback visual imediato
- Ideal para uso na entrada da unidade

## 🎨 DESIGN SYSTEM

### Cores
- **Primary**: Purple (#9333EA)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Background**: Dark Gray (#111827, #1F2937)

### Componentes
- Cards informativos com gradientes
- Badges de status coloridos
- Tabelas responsivas
- Modais para detalhes
- Alertas contextuais

### Dark Mode
- Design profissional em dark mode
- Alto contraste para legibilidade
- Elementos visuais destacados

## 📱 RESPONSIVIDADE

✅ **Desktop** (1920px+): Layout completo com sidebar fixa
✅ **Laptop** (1366px+): Layout otimizado
✅ **Tablet** (768px+): Sidebar recolhível
✅ **Mobile** (375px+): Menu overlay, uso emergencial

## 🗂️ ESTRUTURA DE PASTAS

```
app/
├── (admin)/                    # Grupo de rotas admin
│   ├── layout.tsx             # Layout com sidebar
│   ├── page.tsx               # Redirect para /dashboard
│   ├── dashboard/             # Dashboard principal
│   ├── usuarios/              # Gestão de usuários
│   ├── check-in/              # Check-in administrativo
│   ├── turmas/                # Gestão de turmas
│   ├── agenda/                # Agenda do dia
│   ├── financeiro/            # Controle financeiro
│   ├── alertas/               # Alertas operacionais
│   ├── permissoes/            # Permissões RBAC
│   ├── configuracoes/         # Configurações
│   └── recepcao/              # Modo recepção
├── (main)/                    # App do aluno (não alterado)
│   └── ...
lib/
└── mockAdminData.ts           # Dados simulados do admin
```

## 🔐 REGRA-MÃE DO SISTEMA

```
SEM PAGAMENTO VALIDADO
    ↓
SEM CHECK-IN
    ↓
SEM TREINO
```

## 📊 DADOS MOCKADOS

Todos os dados são simulados em `lib/mockAdminData.ts`:

- **8 Alunos** (Adulto e Kids)
- **3 Instrutores**
- **3 Responsáveis**
- **1 Administrador**
- **6 Turmas** (Gi, No-Gi, Feminino, Kids)
- **Check-ins** de hoje e ontem
- **Histórico** de alterações de status
- **Alertas** operacionais
- **Permissões** por perfil

## 🚦 STATUS OPERACIONAL

### ATIVO (Verde)
- Pagamento em dia
- Pode fazer check-in
- Acesso liberado

### EM ATRASO (Amarelo)
- Pagamento vencido (< 60 dias)
- Ainda pode treinar
- Recebe notificações

### BLOQUEADO (Vermelho)
- Inadimplência > 60 dias
- **NÃO pode fazer check-in**
- Acesso bloqueado

## 🎯 FLUXO DE CHECK-IN

1. Aluno chega na unidade
2. Busca pelo nome/ID na recepção
3. Sistema verifica STATUS OPERACIONAL
4. Se ATIVO ou EM_ATRASO → Check-in liberado
5. Se BLOQUEADO → Mensagem de bloqueio
6. Check-in registrado com data/hora

## 👥 CHECK-IN KIDS

- Crianças **NÃO** fazem check-in sozinhas
- Apenas o **Responsável** pode validar
- Sistema associa Pai → Filho
- Check-in registra validação do responsável

## 🔧 COMO USAR

### Acessar o Painel Admin
```bash
# Inicie o servidor
pnpm dev

# Acesse no navegador
http://localhost:3000/dashboard
```

### Navegação
- Use a **sidebar** para navegar entre módulos
- Clique em **Modo Recepção** para interface simplificada
- Clique no avatar para ver menu do usuário

### Gestão de Alunos
1. Acesse **Usuários**
2. Use filtros para buscar
3. Clique em um aluno para ver detalhes
4. Use ações para editar ou alterar status

### Validar Check-in
1. Acesse **Check-in** ou **Modo Recepção**
2. Busque o aluno pelo nome
3. Clique em **Validar Check-in**
4. Sistema verifica status e confirma

### Gerenciar Turmas
1. Acesse **Turmas**
2. Veja ocupação de cada turma
3. Clique para ver alunos matriculados
4. Edite horários e configurações

## 🎓 PERMISSÕES POR PERFIL

| Permissão | Professor | Coordenador | Gestor | Admin | Super Admin |
|-----------|-----------|-------------|--------|-------|-------------|
| Validar Check-in | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editar Turma | ❌ | ✅ | ✅ | ✅ | ✅ |
| Ver Relatórios | ❌ | ❌ | ✅ | ✅ | ✅ |
| Validar Pagamento | ❌ | ❌ | ✅ | ✅ | ✅ |
| Bloquear Aluno | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ❌ | ✅ | ✅ |
| Configurar Sistema | ❌ | ❌ | ❌ | ❌ | ✅ |

## ⚠️ IMPORTANTE

### O QUE FOI IMPLEMENTADO
✅ Front-end completo do painel administrativo
✅ Todos os módulos funcionais
✅ Dados mockados realistas
✅ UX profissional enterprise
✅ Responsividade completa
✅ Sistema de permissões visual

### O QUE NÃO FOI IMPLEMENTADO
❌ Backend / API
❌ Banco de dados
❌ Autenticação real
❌ Gateway de pagamento
❌ Processamento de pagamentos
❌ Envio de notificações
❌ Relatórios em PDF
❌ Backup de dados

## 🔮 PRÓXIMOS PASSOS (Sugestões)

1. **Backend**: Implementar API REST
2. **Database**: PostgreSQL ou MongoDB
3. **Auth**: NextAuth.js ou Clerk
4. **Pagamentos**: Stripe ou Mercado Pago
5. **Email**: Nodemailer para notificações
6. **Relatórios**: jsPDF ou react-pdf
7. **Analytics**: Dashboard com gráficos
8. **Mobile App**: React Native para alunos

## 📞 SUPORTE

Este é um projeto front-end completo e funcional.
Todos os dados são simulados para demonstração.

Para integração com backend real, consulte a documentação de APIs REST.

## 📄 LICENÇA

Este projeto foi desenvolvido como demonstração de interface administrativa.

---

**BLACKBELT** - Sistema de Gestão Profissional para Unidades
🥋 Desenvolvido com Next.js 14, React 18 e TailwindCSS
