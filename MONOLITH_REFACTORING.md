# Refatoração de Componentes Monolíticos — BLACKBELT

## Resumo Executivo

Dois componentes monolíticos (1.839 linhas combinadas) foram decompostos em 20 arquivos modulares com separação por responsabilidade. Nenhum arquivo lógico excede 200 linhas. Zero alteração visual, zero perda funcional.

---

## 1. LegalModal (1.025 → 6 arquivos + re-export)

### Diagnóstico

O componente era 85% dados estáticos (strings de conteúdo legal) embutidos dentro de lógica React. A função `getDefaultContent()` continha ~860 linhas de texto puro, impedindo tree-shaking e poluindo a lógica do componente.

### Decomposição

| Arquivo | Linhas | Responsabilidade |
|---------|--------|------------------|
| `LegalModal/types.ts` | 6 | Interface `LegalModalProps` |
| `LegalModal/legal-contents.ts` | 869 | Conteúdos legais estáticos + `getLegalContent()` |
| `LegalModal/useLegalModal.ts` | 35 | Hook: ESC handler + body scroll lock |
| `LegalModal/LegalContentRenderer.tsx` | 45 | Parser markdown-like → JSX |
| `LegalModal/LegalModal.tsx` | 107 | Componente orquestrador (overlay, header, footer) |
| `LegalModal/index.ts` | 5 | Barrel export |
| `LegalModal.tsx` (raiz) | 11 | Re-export para backward compatibility |

### Compatibilidade

O import original `import { LegalModal } from '@/components/modals/LegalModal'` continua funcionando sem alteração, tanto em imports diretos (cadastro) quanto em `dynamic()` (landing).

---

## 2. Cadastro page.tsx (814 → 14 arquivos)

### Diagnóstico

Um único componente gerenciava 6 steps de formulário wizard, câmera/upload de foto, validação, gerenciamento de filhos e integração com authService. Cada step era um bloco JSX inline de 35-100 linhas.

### Decomposição

| Arquivo | Linhas | Responsabilidade |
|---------|--------|------------------|
| `_components/types.ts` | 28 | Tipos compartilhados (Step, Perfil, DadosUsuario, DadosKid) |
| `_components/constants.ts` | 16 | AVATARES + STEP_TITLES |
| `_components/utils.ts` | 22 | calcIdade, determinaPerfil, validaSenha |
| `_components/useCamera.ts` | 62 | Hook: stream, captura, cleanup |
| `_components/ErrorAlert.tsx` | 18 | Componente reutilizável de erro |
| `_components/CadastroLoading.tsx` | 18 | Spinner de loading |
| `_components/StepEmail.tsx` | 45 | Step 1: email input |
| `_components/StepSenha.tsx` | 78 | Step 2: senha + confirmação |
| `_components/StepDados.tsx` | 60 | Step 3: nome + data nascimento |
| `_components/StepAvatar.tsx` | 148 | Step 4: emoji grid + câmera + upload |
| `_components/StepKids.tsx` | 138 | Step 5: gerenciamento de filhos |
| `_components/StepRevisao.tsx` | 117 | Step 6: revisão + termos |
| `_components/index.ts` | 11 | Barrel export |
| `page.tsx` | 194 | Orquestrador: state + handlers + routing |

### Decisões Técnicas

1. **`querKids` state movido para StepKids**: O estado sim/não de kids é local ao step, eliminando poluição no componente pai.
2. **`aceite` state movido para StepRevisao**: Mesmo princípio — estado de UI local ao step.
3. **`useCamera` como hook isolado**: Camera stream lifecycle desacoplado do componente de avatar, com cleanup automático.
4. **`onAddKid` retorna `string | null`**: Validação ocorre no pai (tem acesso a `calcIdade`), step recebe feedback via retorno.
5. **`voltar()` usa lookup table**: Substituiu cadeia de `if/else` por `Record<Step, Step | null>`.

---

## Estrutura Final

```
components/modals/
├── LegalModal.tsx                    (11)  re-export backward-compat
└── LegalModal/
    ├── index.ts                       (5)
    ├── types.ts                       (6)
    ├── legal-contents.ts            (869)  dados puros
    ├── useLegalModal.ts              (35)
    ├── LegalContentRenderer.tsx      (45)
    └── LegalModal.tsx               (107)

app/(auth)/cadastro/
├── page.tsx                         (194)  orquestrador
└── _components/
    ├── index.ts                      (11)
    ├── types.ts                      (28)
    ├── constants.ts                  (16)
    ├── utils.ts                      (22)
    ├── useCamera.ts                  (62)
    ├── ErrorAlert.tsx                (18)
    ├── CadastroLoading.tsx           (18)
    ├── StepEmail.tsx                 (45)
    ├── StepSenha.tsx                 (78)
    ├── StepDados.tsx                 (60)
    ├── StepAvatar.tsx               (148)
    ├── StepKids.tsx                 (138)
    └── StepRevisao.tsx              (117)
```

## Métricas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos lógicos | 2 | 20 |
| Maior arquivo lógico | 1.025 linhas | 194 linhas |
| page.tsx (cadastro) | 814 linhas | 194 linhas |
| LegalModal lógica | 1.025 linhas | 107 linhas |
| Reusáveis criados | 0 | 4 (ErrorAlert, useCamera, LegalContentRenderer, useLegalModal) |
| Breaking changes | — | 0 |
| Consumers afetados | — | 0 (backward-compat via re-export) |

## Backups

- `_backup/LegalModal-ORIGINAL.tsx` (1.025 linhas)
- `_backup/cadastro-page-ORIGINAL.tsx` (814 linhas)
