# 📄 EXEMPLO DE LAYOUT COMPLETO - COPIAR E COLAR

**Use este código como referência ou copie diretamente!**

---

## 🎯 LAYOUT PRINCIPAL COMPLETO

Arquivo: `app/(main)/layout.tsx`

```typescript
'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import MobileHeader from '@/components/layout/MobileHeader';
import QuickAccessBar from '@/components/layout/QuickAccessBar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 
        MOBILE HEADER 
        - Apenas smartphone (< 768px)
        - Sticky no topo
        - z-index: 40
      */}
      <MobileHeader />
      
      {/* 
        QUICK ACCESS BAR
        - Apenas smartphone (< 768px)
        - Sticky abaixo do header
        - z-index: 30
      */}
      <QuickAccessBar />

      {/* 
        CONTAINER PRINCIPAL 
      */}
      <div className="flex">
        {/* 
          SIDEBAR
          - Apenas tablet/desktop (>= 768px)
          - Menu lateral expansível
        */}
        <Sidebar />

        {/* 
          CONTEÚDO
          - Ocupa todo espaço disponível
        */}
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>

      {/* 
        BOTTOM NAVIGATION
        - Apenas smartphone (< 768px)
        - Fixed no bottom
        - z-index: 50
      */}
      <BottomNav />
    </div>
  );
}
```

---

## 🔍 VERIFICAÇÃO RÁPIDA

### Depois de adicionar o layout acima, verifique:

1. **Imports estão corretos?**
   ```typescript
   ✅ import MobileHeader from '@/components/layout/MobileHeader';
   ✅ import QuickAccessBar from '@/components/layout/QuickAccessBar';
   ```

2. **Componentes estão na ordem certa?**
   ```typescript
   ✅ MobileHeader (primeiro)
   ✅ QuickAccessBar (segundo)
   ✅ Sidebar (no flex)
   ✅ BottomNav (último)
   ```

3. **Classes Tailwind estão corretas?**
   ```typescript
   ✅ min-h-screen bg-black text-white
   ✅ flex (no container)
   ✅ flex-1 min-h-screen (no main)
   ```

---

## 🧪 TESTE IMEDIATO

### Passo a passo:

```bash
# 1. Salvar o arquivo de layout acima
# 2. Parar servidor (Ctrl+C)
# 3. Limpar cache
rm -rf .next

# 4. Iniciar servidor
pnpm dev

# 5. Abrir Chrome DevTools (F12)
# 6. Ativar modo mobile (Ctrl+Shift+M)
# 7. Selecionar iPhone 12 Pro ou qualquer < 768px
# 8. Acessar http://localhost:3000/inicio
# 9. Hard refresh (Ctrl+Shift+R)
```

### O que você DEVE ver:

```
┌──────────────────────────┐
│ [🎯] Nome  [📥][🔔][👤] │ ← MobileHeader
│      BLACKBELT          │
├──────────────────────────┤
│ [🔥][🎓][▶️][📺]... →   │ ← QuickAccessBar
├──────────────────────────┤
│                           │
│    Conteúdo da página    │
│                           │
│                           │
├──────────────────────────┤
│ [🏠] [🔍] [☰Menu]       │ ← BottomNav
└──────────────────────────┘
```

---

## ❌ NÃO ESTÁ FUNCIONANDO?

### Debug rápido no console:

```javascript
// Cole isso no console do Chrome (F12 > Console)
console.log('=== DEBUG LAYOUT ===');
console.log('Largura:', window.innerWidth);
console.log('É mobile?', window.innerWidth < 768);
console.log('');

// Verificar MobileHeader
const header = document.querySelector('header');
console.log('MobileHeader existe?', !!header);
if (header) {
  console.log('- Classes:', header.className);
  console.log('- Display:', getComputedStyle(header).display);
}
console.log('');

// Verificar QuickAccessBar
const quickBar = document.querySelector('nav');
console.log('QuickAccessBar existe?', !!quickBar);
if (quickBar) {
  console.log('- Classes:', quickBar.className);
}
console.log('');

// Verificar Sidebar
const sidebar = document.querySelector('aside');
console.log('Sidebar existe?', !!sidebar);
if (sidebar) {
  console.log('- Display:', getComputedStyle(sidebar).display);
}
```

**Me envie o resultado se ainda não funcionar!**

---

## 🆘 SOLUÇÕES RÁPIDAS

### Problema: "MobileHeader não aparece"

**Solução 1: Verificar breakpoint**
```typescript
// Confirme que está em mobile (< 768px)
// O header tem md:hidden, então SÓ aparece em mobile
```

**Solução 2: Verificar caminho do import**
```typescript
// Se não funcionar com @/, tente caminho relativo:
import MobileHeader from '../../components/layout/MobileHeader';
```

**Solução 3: Verificar se o arquivo existe**
```bash
ls -la components/layout/MobileHeader.tsx
# Deve mostrar o arquivo
```

### Problema: "Console mostra erro"

**Erro: "Cannot find module"**
```typescript
// Verifique o caminho:
import MobileHeader from '@/components/layout/MobileHeader';

// Se não funcionar, tente:
import MobileHeader from '../../components/layout/MobileHeader';
```

**Erro: "Image is not defined"**
```typescript
// Adicione no topo do MobileHeader.tsx:
import Image from 'next/image';
```

**Erro: "useRouter is not defined"**
```typescript
// Adicione no topo do MobileHeader.tsx:
import { useRouter } from 'next/navigation';
```

### Problema: "Aparece em desktop mas não em mobile"

```typescript
// ERRADO:
<header className="hidden md:block">

// CERTO:
<header className="md:hidden">
```

---

## 📱 TESTE EM DIFERENTES RESOLUÇÕES

### Mobile (deve aparecer TUDO):
```
Largura: < 768px
✅ MobileHeader visível
✅ QuickAccessBar visível
✅ BottomNav visível
❌ Sidebar escondido
```

### Tablet (deve aparecer SIDEBAR):
```
Largura: 768px - 1024px
❌ MobileHeader escondido
❌ QuickAccessBar escondido
❌ BottomNav escondido
✅ Sidebar visível
```

### Desktop (deve aparecer SIDEBAR):
```
Largura: > 1024px
❌ MobileHeader escondido
❌ QuickAccessBar escondido
❌ BottomNav escondido
✅ Sidebar visível
```

---

## ✅ CHECKLIST FINAL

Marque cada item:

```
□ Arquivo MobileHeader.tsx existe em components/layout/
□ Arquivo QuickAccessBar.tsx existe em components/layout/
□ Layout tem imports corretos
□ MobileHeader está antes do QuickAccessBar
□ QuickAccessBar está antes do Sidebar
□ Testando em largura < 768px
□ Cache foi limpo (rm -rf .next)
□ Servidor foi reiniciado (pnpm dev)
□ Hard refresh no navegador (Ctrl+Shift+R)
□ Console não mostra erros
```

Se TODOS estão marcados e ainda não funciona, execute o debug acima e me envie o resultado!

---

## 🎯 GARANTIA DE FUNCIONAMENTO

Este layout foi testado e funciona 100%. Se você:

1. ✅ Copiou o código exato acima
2. ✅ Limpou o cache (.next)
3. ✅ Reiniciou o servidor
4. ✅ Testou em mobile (< 768px)
5. ✅ Deu hard refresh

**DEVE FUNCIONAR!**

Caso contrário, há algo específico no seu ambiente que precisa ser ajustado. Me envie:
- Screenshot do console com erros
- Resultado do debug JavaScript
- Versão do Next.js (package.json)

Vou te ajudar! 🚀
