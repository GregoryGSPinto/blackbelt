# Vídeo de Prova de Vida — Roteiro (2 minutos)

> Gravar tela do navegador (Chrome DevTools mobile ou desktop).
> Sem edição. Fluxo direto. Narração opcional.

---

## Setup antes de gravar

```bash
pnpm dev
# Abrir http://localhost:3000
# Chrome DevTools → Toggle Device (iPhone 14 Pro ou desktop)
```

## Roteiro (7 cenas, ~15s cada)

### Cena 1 — Login (0:00 - 0:15)
1. Tela de login visível (logo + campos)
2. Digitar: `professor@blackbelt.com` / `blackbelt123`
3. Clicar "Entrar"
4. Mostrar tela de seleção de perfil → clicar "Instrutor"

### Cena 2 — Dashboard Instrutor (0:15 - 0:30)
1. Dashboard carrega com stats + Quick Actions
2. Scroll rápido mostrando cards de turmas
3. Clicar "Iniciar Aula" (Quick Actions ou botão)

### Cena 3 — Modo Sessão Ativa (0:30 - 0:50)
1. StartClassModal abre → selecionar turma → confirmar
2. ActiveClassMode ativa (timer visível)
3. Mostrar lista de alunos da turma

### Cena 4 — Check-in (0:50 - 1:05)
1. Clicar no FAB de Check-in (canto inferior)
2. Sheet abre com opções (QR/Manual)
3. Fazer check-in manual (digitar código)
4. Toast de confirmação aparece

### Cena 5 — Atualizar Progresso (1:05 - 1:20)
1. Ir para professor-alunos → clicar em um aluno
2. Detalhe do aluno carrega
3. Usar QuickProgressUpdate (selecionar faixa/status)
4. Feedback visual de salvamento

### Cena 6 — Conceder Conquista (1:20 - 1:35)
1. No mesmo aluno, clicar "Conceder Conquista"
2. ConcederConquistaModal abre
3. Selecionar conquista → confirmar
4. Toast de sucesso

### Cena 7 — Logout (1:35 - 2:00)
1. Abrir menu (hamburguer ou sidebar)
2. Clicar "Sair"
3. ConfirmModal aparece: "Tem certeza?"
4. Confirmar → volta para tela de login
5. FIM

---

## Dicas de gravação

- **macOS**: QuickTime Player → File → New Screen Recording
- **Windows**: Win+G (Game Bar) ou OBS Studio
- **Chrome**: Extensão "Screencastify" ou "Loom"
- **Resolução**: 1920x1080 ou 1280x720
- **Formato**: MP4
- **Tamanho esperado**: ~20-50MB
