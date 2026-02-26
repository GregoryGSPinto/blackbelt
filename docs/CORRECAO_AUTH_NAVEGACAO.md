# CORREÇÃO — Autenticação Global & Navegação

**Data:** 2026-02-09
**Escopo:** Front-end only, zero backend changes, zero novos contextos

---

## PROBLEMA RAIZ

O `AuthContext.loadSession()` continha um **fallback automático para admin**:
quando não havia sessão (`blackbelt_session`) no localStorage, o sistema
criava um `defaultAdmin` e o definia como usuário autenticado.

**Consequência:** todas as rotas protegidas renderizavam sem login,
porque `user` nunca era `null`.

```
// ANTES (AuthContext.tsx, linha 293-307)
if (!sessionStr) {
  const defaultAdmin: User = { ... };   // ← criava admin fake
  setUser(defaultAdmin);                 // ← "logado" sem login
}
```

---

## CORREÇÕES IMPLEMENTADAS

### 1. AuthContext — Remoção do defaultAdmin

**Arquivo:** `contexts/AuthContext.tsx`

```
// DEPOIS
if (!sessionStr) {
  setUser(null);      // ← sem sessão = não autenticado
  setLoading(false);
}
```

Agora `user === null` quando não há sessão válida.

---

### 2. ProtectedRoute — Guard Centralizado

**Arquivo:** `components/shared/ProtectedRoute.tsx` (NOVO)

Componente wrapper que:
- Bloqueia renderização se `!user` → redireciona para `/login`
- Valida `user.tipo` contra `allowedTypes[]` → redireciona para rota correta
- Exibe spinner durante loading/redirect

Uso em todos os layouts protegidos:
```tsx
<ProtectedRoute allowedTypes={['ADMINISTRADOR', 'SUPER_ADMIN']}>
  <AdminLayoutInner>{children}</AdminLayoutInner>
</ProtectedRoute>
```

---

### 3. Layouts Protegidos — Todos Atualizados

| Layout | allowedTypes | Guard |
|--------|-------------|-------|
| `(admin)` | ADMINISTRADOR, SUPER_ADMIN, GESTOR, PROFESSOR | ProtectedRoute ✅ |
| `(main)` | ALUNO_ADULTO | ProtectedRoute ✅ |
| `(teen)` | ALUNO_TEEN | ProtectedRoute ✅ |
| `(kids)` | ALUNO_KIDS | ProtectedRoute ✅ |
| `(parent)` | RESPONSAVEL | ProtectedRoute ✅ |
| `(auth)` | — (público) | Sem proteção ✅ |

---

### 4. UserAccountMenu — Desktop (NOVO)

**Arquivo:** `components/shared/UserAccountMenu.tsx`

Componente reutilizável com:
- Avatar + nome + tipo do perfil (via AuthContext)
- Dropdown com: **Trocar Perfil** + **Sair**
- 3 variantes visuais: `dark`, `light`, `teen`
- Consumo exclusivo do AuthContext

Usado em:
- Admin layout (header desktop)
- Main layout (Header.tsx)

---

### 5. MobileAccountBar — Smartphones (NOVO)

**Arquivo:** `components/shared/MobileAccountBar.tsx`

Barra superior mobile (< md breakpoint) com:
- Logo BlackBelt (esquerda)
- Nome do usuário (discreto)
- Botão de conta com dropdown: **Trocar Perfil** + **Sair**
- 2 variantes: `dark`, `light`

Usado em:
- Admin layout
- Main layout
- Parent layout

---

### 6. MobileDrawer — Atualizado

**Arquivo:** `components/layout/MobileDrawer.tsx`

Adicionado ao footer do drawer:
- Informações do usuário (nome, perfil, graduação)
- Botão **Trocar Perfil**
- Botão **Sair** (via AuthContext.logout)

---

### 7. Header Desktop — Atualizado

**Arquivo:** `components/layout/Header.tsx`

Substituído dropdown manual por `UserAccountMenu` reutilizável.

---

### 8. Kids Layout — Auth Guard + Menu de Conta

**Arquivo:** `app/(kids)/layout.tsx`

- Envolvido em `ProtectedRoute` com `allowedTypes={['ALUNO_KIDS']}`
- Avatar agora abre dropdown com: Trocar Perfil + Sair
- Usa AuthContext para dados e logout

---

### 9. Teen Layout — ProtectedRoute + Trocar Perfil

**Arquivo:** `app/(teen)/layout.tsx`

- Guard manual substituído por `ProtectedRoute`
- Adicionado botão **Trocar Perfil** no dropdown
- Mantido header teen com estilo próprio

---

### 10. Parent Layout — Auth Guard + MobileAccountBar

**Arquivo:** `app/(parent)/layout.tsx`

- Envolvido em `ProtectedRoute` com `allowedTypes={['RESPONSAVEL']}`
- Logout agora usa `AuthContext.logout()` (antes: `router.push('/login')`)
- Adicionado **Trocar Perfil** no dropdown desktop
- Adicionado `MobileAccountBar` para smartphones

---

## FLUXO DE AUTENTICAÇÃO (PÓS-CORREÇÃO)

```
[Usuário abre app]
     │
     ▼
[AuthContext.loadSession()]
     │
     ├── blackbelt_session existe? → setUser(session) → loading=false
     │
     └── blackbelt_session NÃO existe? → setUser(null) → loading=false
                                              │
                                              ▼
                                    [ProtectedRoute verifica]
                                              │
                                              ├── user === null → redirect /login
                                              │
                                              └── user.tipo ∉ allowedTypes → redirect rota correta
```

---

## MAPA DE REDIRECIONAMENTO

| Tipo de Perfil | Rota Destino |
|---------------|-------------|
| ALUNO_ADULTO | /inicio |
| ALUNO_TEEN | /teen-inicio |
| ALUNO_KIDS | /kids-inicio |
| RESPONSAVEL | /painel-responsavel |
| PROFESSOR | /dashboard |
| GESTOR | /dashboard |
| ADMINISTRADOR | /dashboard |
| SUPER_ADMIN | /dashboard |

---

## VERIFICAÇÃO

| Check | Status |
|-------|--------|
| defaultAdmin removido | ✅ |
| ProtectedRoute em todos os layouts | ✅ |
| Auth layout livre de proteção | ✅ |
| Logout via AuthContext em todos | ✅ |
| MobileAccountBar (admin, main, parent) | ✅ |
| Menu de conta (teen, kids) | ✅ |
| UserAccountMenu desktop (admin, main) | ✅ |
| Trocar Perfil em todos os menus | ✅ |
| Sem router.push('/login') direto | ✅ |
| Zero novos contextos | ✅ |
| Zero alterações backend | ✅ |

---

## ARQUIVOS MODIFICADOS

| Arquivo | Ação |
|---------|------|
| `contexts/AuthContext.tsx` | Modificado (removido defaultAdmin) |
| `components/shared/ProtectedRoute.tsx` | **Criado** |
| `components/shared/UserAccountMenu.tsx` | **Criado** |
| `components/shared/MobileAccountBar.tsx` | **Criado** |
| `app/(admin)/layout.tsx` | Reescrito |
| `app/(main)/layout.tsx` | Reescrito |
| `app/(teen)/layout.tsx` | Reescrito |
| `app/(kids)/layout.tsx` | Reescrito |
| `app/(parent)/layout.tsx` | Reescrito |
| `components/layout/Header.tsx` | Reescrito |
| `components/layout/MobileDrawer.tsx` | Modificado |

---

## ARQUIVOS NÃO ALTERADOS (confirmado)

- `contexts/AuthContext.tsx` — apenas remoção do fallback
- `lib/api/auth.service.ts` — intocado
- `app/(auth)/login/page.tsx` — intocado
- `app/(auth)/cadastro/page.tsx` — intocado
- `app/(auth)/layout.tsx` — intocado
- `app/layout.tsx` — intocado
- `app/page.tsx` — intocado
