# 🎨 AJUSTE DE VISIBILIDADE DA IMAGEM

**Escolha o nível de visibilidade da imagem de fundo**

---

## 🔧 OPÇÕES DE VISIBILIDADE

### OPÇÃO 1: VISIBILIDADE MÉDIA (Padrão Atual)
**Arquivo:** `components/ui/CinematicBackground.tsx`

```typescript
// Opacidade da imagem
opacity-70 dark:opacity-60

// Overlay
from-black/40 via-black/30 to-black/50
```

**Resultado:**
- ✅ Imagem visível mas elegante
- ✅ Texto sempre legível
- ✅ Profundidade cinematográfica

---

### OPÇÃO 2: MÁXIMA VISIBILIDADE (Imagem Destacada)
**Arquivo:** `components/ui/CinematicBackgroundHighVis.tsx`

```typescript
// SEM opacidade na imagem
className="object-cover scale-110"

// Overlay MUITO suave
from-black/20 via-transparent to-black/30
```

**Resultado:**
- ✅ Imagem BEM VISÍVEL
- ✅ Logo e tatami destacados
- ⚠️ Texto pode precisar de sombra

**Como usar:**
```typescript
// Substituir import em cada página
import CinematicBackground from '@/components/ui/CinematicBackgroundHighVis';
```

---

### OPÇÃO 3: VISIBILIDADE BAIXA (Sutil)

```typescript
// Opacidade baixa
opacity-40 dark:opacity-30

// Overlay mais escuro
from-black/60 via-black/50 to-black/70
```

**Resultado:**
- ✅ Elegância premium
- ✅ Foco no conteúdo
- ⚠️ Imagem menos visível

---

## 🚀 COMO APLICAR

### Para MÁXIMA VISIBILIDADE (Recomendado!)

**1. Edite cada página:**

```typescript
// app/(auth)/landing/page.tsx
import CinematicBackground from '@/components/ui/CinematicBackgroundHighVis';

// app/(auth)/login/page.tsx
import CinematicBackground from '@/components/ui/CinematicBackgroundHighVis';

// app/(auth)/cadastro/page.tsx
import CinematicBackground from '@/components/ui/CinematicBackgroundHighVis';
```

**OU**

**2. Renomeie os arquivos:**

```bash
# Backup do atual
mv components/ui/CinematicBackground.tsx components/ui/CinematicBackgroundMedium.tsx

# Use o HIGH VIS como padrão
mv components/ui/CinematicBackgroundHighVis.tsx components/ui/CinematicBackground.tsx
```

---

## 🎨 AJUSTE FINO MANUAL

### No arquivo: `components/ui/CinematicBackground.tsx`

```typescript
// LINHA 37: Opacidade da imagem
className="object-cover opacity-70 dark:opacity-60 scale-110"
          //                  ↑ Aumente para mais visível
          //                  ↓ Diminua para mais sutil
          
// Valores sugeridos:
// opacity-90 = Muito visível
// opacity-70 = Médio (padrão)
// opacity-50 = Sutil
// opacity-30 = Muito sutil

// LINHA 50: Overlay escuro
from-black/40 via-black/30 to-black/50
//        ↑ Diminua para imagem mais visível
//        ↓ Aumente para imagem mais escura

// Valores sugeridos:
// from-black/20 via-transparent to-black/30 = Imagem MUITO visível
// from-black/40 via-black/30 to-black/50 = Médio (padrão)
// from-black/60 via-black/50 to-black/70 = Imagem sutil
```

---

## 🧪 TESTE RÁPIDO

```bash
# 1. Faça a mudança
# 2. Salve o arquivo
# 3. Navegador atualiza automaticamente (hot reload)
# 4. Veja o resultado
```

---

## 📊 COMPARAÇÃO

| Nível | Opacidade | Overlay | Uso Recomendado |
|-------|-----------|---------|-----------------|
| **Máximo** | 100% | black/20 | Mostrar imagem |
| **Alto** | 80% | black/30 | Destacar marca |
| **Médio** | 70% | black/40 | ✅ Balanceado |
| **Baixo** | 50% | black/60 | Foco no texto |
| **Mínimo** | 30% | black/80 | Sutil/elegante |

---

## 💡 RECOMENDAÇÃO

**Para ver a imagem do tatami BEM DESTACADA:**

Use a versão **HIGH VISIBILITY** (CinematicBackgroundHighVis.tsx)

```typescript
// Opacidade: 100% (sem filtro)
// Overlay: black/20 to black/30 (muito suave)
```

**Resultado:**
- 🦁 Logo BlackBelt visível
- 🥋 Tatami com linhas vermelhas destacado
- ✨ Efeitos cinematográficos preservados

---

## 🎯 QUICK FIX

**Se quiser imagem MUITO visível AGORA:**

```bash
# 1. Abra o arquivo
components/ui/CinematicBackground.tsx

# 2. Linha 37, mude para:
className="object-cover opacity-90 scale-110"

# 3. Linha 50, mude para:
from-black/20 via-transparent to-black/30

# 4. Salve
# 5. Veja a diferença!
```

---

**Agora a imagem vai aparecer! 🎨**
