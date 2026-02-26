# 🔍 TROUBLESHOOTING - HEADER MOBILE NÃO APARECE

**Problema:** Barra superior não aparece na versão mobile  
**Objetivo:** Diagnosticar e resolver passo a passo  

---

## ✅ PASSO 1: VERIFICAR ARQUIVOS

### 1.1 Confirmar que os arquivos existem

```bash
# Execute no terminal do projeto:
ls -la components/layout/MobileHeader.tsx
ls -la components/layout/QuickAccessBar.tsx
```

**Resultado esperado:**
```
components/layout/MobileHeader.tsx (existe)
components/layout/QuickAccessBar.tsx (existe)
```

❌ **Se não existirem:** Copie os arquivos do ZIP para a pasta correta.

---

## ✅ PASSO 2: VERIFICAR INTEGRAÇÃO NO LAYOUT

### 2.1 Qual arquivo de layout está usando?

Identifique o arquivo de layout principal. Pode ser:
- `app/(main)/layout.tsx`
- `app/layout.tsx`
- Outro arquivo de layout específico

### 2.2 Verificar imports

Abra o arquivo de layout e verifique se tem:

```typescript
import MobileHeader from '@/components/layout/MobileHeader';
import QuickAccessBar from '@/components/layout/QuickAccessBar';
```

❌ **Se não tiver:** Adicione os imports no topo do arquivo.

### 2.3 Verificar se os componentes estão renderizados

Procure no JSX/TSX:

```typescript
return (
  <div>
    {/* DEVE TER ISSO: */}
    <MobileHeader />
    <QuickAccessBar />
    
    {/* Resto do layout... */}
  </div>
);
```

❌ **Se não tiver:** Adicione os componentes dentro do return.

---

## ✅ PASSO 3: VERIFICAR BREAKPOINT MOBILE

### 3.1 Confirmar que está testando em mobile REAL

O header só aparece em **< 768px** de largura.

**Como testar corretamente:**

#### Opção A: Chrome DevTools
```
1. Abra o Chrome
2. Pressione F12 (DevTools)
3. Clique no ícone de dispositivo (📱) ou Ctrl+Shift+M
4. Selecione "Responsive" ou um dispositivo específico
5. Ajuste largura para MENOS de 768px
6. Force refresh: Ctrl+Shift+R
```

#### Opção B: Redimensionar manualmente
```
1. Arraste a janela do navegador
2. Reduza a largura até ficar bem estreita (< 768px)
3. Force refresh: Ctrl+Shift+R
```

#### Opção C: Dispositivo real
```
1. Acesse via smartphone
2. URL: http://SEU-IP:3000
3. Teste em 4G/WiFi
```

### 3.2 Verificar largura atual

Cole isso no console do navegador:

```javascript
console.log('Largura:', window.innerWidth, 'px');
console.log('Mobile?', window.innerWidth < 768);
```

**Resultado esperado:**
```
Largura: 375 px (ou qualquer valor < 768)
Mobile? true
```

❌ **Se Mobile? false:** Você está em resolução desktop/tablet!

---

## ✅ PASSO 4: VERIFICAR CSS E CLASSES

### 4.1 Inspecionar o elemento

No Chrome DevTools (F12):

```
1. Clique na seta de seleção (Ctrl+Shift+C)
2. Tente clicar onde DEVERIA estar o header
3. Veja se aparece <header> no inspector
```

### 4.2 Verificar classe md:hidden

Se encontrou o `<header>`, verifique se tem:

```css
/* Deve ter: */
.md\:hidden {
  @media (min-width: 768px) {
    display: none;
  }
}
```

**No mobile (< 768px):** Header deve estar VISÍVEL  
**No desktop (>= 768px):** Header deve estar ESCONDIDO  

### 4.3 Verificar se Tailwind está funcionando

Cole no console:

```javascript
// Verificar se classes Tailwind existem
const header = document.querySelector('header');
console.log('Header encontrado?', !!header);
console.log('Classes:', header?.className);
```

❌ **Se não encontrar header:** Componente não está sendo renderizado!

---

## ✅ PASSO 5: VERIFICAR ERROS NO CONSOLE

### 5.1 Abrir console do navegador

```
1. Pressione F12
2. Aba "Console"
3. Procure erros em VERMELHO
```

### 5.2 Erros comuns

#### Erro: "Cannot find module '@/components/layout/MobileHeader'"
**Solução:**
```typescript
// Tente caminho relativo:
import MobileHeader from '../../components/layout/MobileHeader';
```

#### Erro: "Image is not defined"
**Solução:**
```typescript
// Adicione import:
import Image from 'next/image';
```

#### Erro: "useRouter is not defined"
**Solução:**
```typescript
// Adicione import:
import { useRouter } from 'next/navigation';
```

---

## ✅ PASSO 6: VERIFICAR ORDEM DOS COMPONENTES

### 6.1 Ordem correta no layout

```typescript
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 1. MOBILE HEADER - PRIMEIRO */}
      <MobileHeader />
      
      {/* 2. QUICK ACCESS BAR - SEGUNDO */}
      <QuickAccessBar />

      {/* 3. FLEX CONTAINER */}
      <div className="flex">
        {/* Sidebar (desktop/tablet) */}
        <Sidebar />

        {/* Conteúdo principal */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* 4. BOTTOM NAV - POR ÚLTIMO */}
      <BottomNav />
    </div>
  );
}
```

❌ **Se ordem diferente:** Pode causar problemas de sticky/z-index.

---

## ✅ PASSO 7: TESTAR COMPONENTE ISOLADO

### 7.1 Criar página de teste

Crie `app/test-header/page.tsx`:

```typescript
'use client';

import MobileHeader from '@/components/layout/MobileHeader';
import QuickAccessBar from '@/components/layout/QuickAccessBar';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black">
      <h1 className="text-white p-4">Teste de Header Mobile</h1>
      <p className="text-white/50 p-4">
        Largura da tela: <span id="width"></span>px
      </p>
      
      <MobileHeader />
      <QuickAccessBar />
      
      <div className="p-4 text-white">
        <p>Se você vê este texto, o layout básico funciona.</p>
        <p>O header deve aparecer acima (se largura &lt; 768px)</p>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          setInterval(() => {
            document.getElementById('width').textContent = window.innerWidth;
          }, 100);
        `
      }} />
    </div>
  );
}
```

### 7.2 Acessar teste

```
http://localhost:3000/test-header
```

✅ **Se aparecer:** Problema está no layout principal  
❌ **Se não aparecer:** Problema está no componente  

---

## ✅ PASSO 8: VERIFICAR CONFLITOS DE CSS

### 8.1 Verificar z-index

Cole no console:

```javascript
const header = document.querySelector('header');
const computed = window.getComputedStyle(header);
console.log('z-index:', computed.zIndex);
console.log('position:', computed.position);
console.log('display:', computed.display);
```

**Esperado:**
```
z-index: 40
position: sticky
display: block (ou flex)
```

### 8.2 Verificar se algo está cobrindo

```javascript
// Ver elemento no topo da posição do header
const topElement = document.elementFromPoint(100, 20);
console.log('Elemento no topo:', topElement);
```

❌ **Se não for o header:** Algo está cobrindo!

---

## ✅ PASSO 9: REBUILD E CACHE

### 9.1 Limpar cache do Next.js

```bash
# Parar servidor (Ctrl+C)

# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar (se necessário)
pnpm add

# Iniciar novamente
pnpm dev
```

### 9.2 Limpar cache do navegador

```
Chrome:
1. Ctrl+Shift+Delete
2. Selecionar "Imagens e arquivos em cache"
3. Limpar dados

Ou:
1. DevTools aberto (F12)
2. Clique direito no botão Refresh
3. "Esvaziar cache e atualizar forçadamente"
```

---

## ✅ PASSO 10: VERIFICAÇÃO FINAL

### 10.1 Checklist completo

Execute cada item e marque:

```
□ Arquivos MobileHeader.tsx e QuickAccessBar.tsx existem
□ Imports estão corretos no layout
□ Componentes estão renderizados no JSX
□ Testando em largura < 768px
□ Console não mostra erros vermelhos
□ Tailwind está funcionando (outras classes funcionam)
□ Ordem dos componentes está correta
□ z-index não está conflitando
□ Cache foi limpo
□ Servidor foi reiniciado
```

### 10.2 Se TUDO foi marcado e ainda não aparece

Execute este debug completo:

```typescript
// Cole no console do navegador (F12)
console.log('=== DEBUG HEADER MOBILE ===');
console.log('Largura:', window.innerWidth);
console.log('É mobile?', window.innerWidth < 768);

const header = document.querySelector('header');
console.log('Header existe?', !!header);

if (header) {
  const styles = window.getComputedStyle(header);
  console.log('Display:', styles.display);
  console.log('Position:', styles.position);
  console.log('Top:', styles.top);
  console.log('z-index:', styles.zIndex);
  console.log('Classes:', header.className);
}

const allHeaders = document.querySelectorAll('header');
console.log('Total de headers:', allHeaders.length);
allHeaders.forEach((h, i) => {
  console.log(`Header ${i}:`, h.className);
});
```

**Me envie o resultado deste debug!**

---

## 🆘 SOLUÇÕES RÁPIDAS COMUNS

### Problema 1: "Não vejo nada em mobile"
```typescript
// Solução: Verificar se tem md:hidden
// O header SÓ aparece em MOBILE (< 768px)
// Em desktop (>= 768px) ele DEVE estar escondido
```

### Problema 2: "Vejo em desktop mas não em mobile"
```typescript
// Solução: Inverter a classe
// ERRADO: className="hidden md:block"
// CERTO:  className="md:hidden"
```

### Problema 3: "Console mostra erro de Image"
```typescript
// Adicionar no topo do MobileHeader.tsx:
import Image from 'next/image';
```

### Problema 4: "Erro de localStorage"
```typescript
// Adicionar verificação:
useEffect(() => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('blackbelt_session');
    // ...
  }
}, []);
```

### Problema 5: "Header aparece mas fica atrás"
```typescript
// Aumentar z-index:
<header className="... z-50"> {/* era z-40 */}
```

---

## 📞 SUPORTE ADICIONAL

Se após TODOS os passos ainda não funcionar:

1. **Tire screenshots:**
   - DevTools com elemento inspecionado
   - Console com erros
   - Network tab
   - Código do layout

2. **Copie e cole:**
   - Resultado do debug completo (Passo 10.2)
   - Conteúdo do arquivo de layout
   - Erros do console

3. **Informações do ambiente:**
   - Sistema operacional
   - Navegador e versão
   - Node.js version (`node -v`)
   - Next.js version (package.json)

---

## ✅ TESTE FINAL - DEVE FUNCIONAR

Se você fez TUDO acima, teste assim:

```bash
# 1. Limpar tudo
rm -rf .next
pnpm dev

# 2. Abrir Chrome
# 3. DevTools (F12)
# 4. Mobile mode (Ctrl+Shift+M)
# 5. iPhone 12 Pro (390x844)
# 6. Acessar localhost:3000
# 7. Hard refresh (Ctrl+Shift+R)
```

**DEVE APARECER:**
```
┌────────────────────────┐
│ [🎯] Nome  [📥][🔔][👤]│
│      BLACKBELT        │
├────────────────────────┤
│ [🔥][🎓][▶️]... (scroll)│
├────────────────────────┤
│                         │
│    Conteúdo aqui       │
│                         │
```

Se ainda assim não aparecer, me envie o resultado do debug! 🔍
