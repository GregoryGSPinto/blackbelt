#!/usr/bin/env node
/**
 * Automated Design Tokens Transformer
 * Adds design token imports and initialization to all page.tsx files,
 * then replaces common hardcoded dark-mode patterns with token-based styles.
 */
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Find all page.tsx files (excluding login which is already done, and non-client components)
const allPages = execSync(
  `find app -name "page.tsx" -not -path "*/node_modules/*" -not -path "*/.next/*"`,
  { encoding: 'utf-8' }
).trim().split('\n').filter(Boolean);

// Skip files that are already transformed or shouldn't be touched
const SKIP = [
  'app/(auth)/login/page.tsx', // Already uses design tokens
];

let modified = 0;
let skipped = 0;

for (const filePath of allPages) {
  if (SKIP.some(s => filePath.endsWith(s))) {
    skipped++;
    continue;
  }

  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Skip non-client components (server components can't use hooks)
  if (!content.includes("'use client'") && !content.includes('"use client"')) {
    skipped++;
    continue;
  }

  // Skip if already has getDesignTokens
  if (content.includes('getDesignTokens')) {
    skipped++;
    continue;
  }

  // ─── Step 1: Add imports ───────────────────────────────
  const hasUseTheme = content.includes("useTheme");

  if (!hasUseTheme) {
    // Add useTheme import + getDesignTokens import after the last import line
    const importInsert = `import { useTheme } from '@/contexts/ThemeContext';\nimport { getDesignTokens } from '@/lib/design-tokens';`;
    content = addImportAfterLastImport(content, importInsert);
  } else {
    // Just add getDesignTokens import
    const importInsert = `import { getDesignTokens } from '@/lib/design-tokens';`;
    content = addImportAfterLastImport(content, importInsert);
  }

  // ─── Step 2: Add tokens initialization ─────────────────
  // Find the component function and add tokens after the first line of hooks/state
  content = addTokensInit(content, hasUseTheme);

  // ─── Step 3: Replace common patterns ───────────────────

  // Page titles: h1 with font-medium text-white → premium title style
  content = content.replace(
    /<h1 className="[^"]*font-medium text-white[^"]*">/g,
    '<h1 style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.textMuted }}>'
  );
  // Alternate order: text-white ... font-medium
  content = content.replace(
    /<h1 className="[^"]*text-white[^"]*font-medium[^"]*">/g,
    '<h1 style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.textMuted }}>'
  );
  // h1 with text-lg/xl/2xl font-medium text-white
  content = content.replace(
    /<h1 className="[^"]*font-medium text-white[^"]*">/g,
    '<h1 style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.textMuted }}>'
  );

  // Subtitle paragraphs: <p className="text-white/50"> or text-white/40
  content = content.replace(
    /<p className="text-white\/50">/g,
    '<p style={{ fontWeight: 300, color: tokens.textMuted }}>'
  );
  content = content.replace(
    /<p className="text-white\/40">/g,
    '<p style={{ fontWeight: 300, color: tokens.textMuted }}>'
  );

  // Stat labels: <p className="text-sm text-white/50 mb-1">
  content = content.replace(
    /<p className="text-sm text-white\/50 mb-1">/g,
    '<p style={{ fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'0.25rem\' }}>'
  );
  content = content.replace(
    /<p className="text-sm text-white\/50 mb-2">/g,
    '<p style={{ fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'0.5rem\' }}>'
  );

  // Glass card containers: bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl
  content = content.replace(
    /className="bg-black\/40 backdrop-blur-xl border border-white\/10 rounded-xl p-6"/g,
    'style={{ ...glass, padding: \'1.5rem\' }}'
  );
  content = content.replace(
    /className="bg-black\/40 backdrop-blur-xl border border-white\/10 rounded-xl p-5"/g,
    'style={{ ...glass, padding: \'1.25rem\' }}'
  );
  content = content.replace(
    /className="bg-black\/40 backdrop-blur-xl border border-white\/10 rounded-xl p-4"/g,
    'style={{ ...glass, padding: \'1rem\' }}'
  );
  content = content.replace(
    /className="bg-black\/40 backdrop-blur-xl border border-white\/10 rounded-xl overflow-hidden"/g,
    'style={{ ...glass, overflow: \'hidden\' }}'
  );
  content = content.replace(
    /className="bg-black\/40 backdrop-blur-xl border border-white\/10 rounded-xl"/g,
    'style={glass}'
  );

  // Simple bg-white/5 cards
  content = content.replace(
    /className="bg-white\/5 border border-white\/10 rounded-xl p-4"/g,
    'style={{ ...glass, padding: \'1rem\' }}'
  );
  content = content.replace(
    /className="bg-white\/5 border border-white\/10 rounded-xl p-6"/g,
    'style={{ ...glass, padding: \'1.5rem\' }}'
  );

  // bg-white/10 rounded-lg cards (inside modals etc)
  content = content.replace(
    /className="bg-white\/10 rounded-lg p-4"/g,
    'style={{ background: tokens.cardBg, borderRadius: \'4px\', padding: \'1rem\' }}'
  );
  content = content.replace(
    /className="bg-white\/10 rounded-lg p-3"/g,
    'style={{ background: tokens.cardBg, borderRadius: \'4px\', padding: \'0.75rem\' }}'
  );

  // Stat big numbers: text-2xl sm:text-3xl lg:text-4xl font-medium text-COLOR
  content = content.replace(
    /className="text-2xl sm:text-3xl lg:text-4xl font-medium (text-[a-z]+-\d+)"/g,
    (_, colorClass) => `className="${colorClass}" style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em' }}`
  );

  // Bold stat numbers: text-xl sm:text-2xl lg:text-3xl font-medium
  content = content.replace(
    /className="text-xl sm:text-2xl lg:text-3xl font-medium (text-[a-z]+-\d+)"/g,
    (_, colorClass) => `className="${colorClass}" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}`
  );

  // text-xl sm:text-2xl font-medium text-COLOR
  content = content.replace(
    /className="text-xl sm:text-2xl font-medium (text-[a-z]+-\d+)"/g,
    (_, colorClass) => `className="${colorClass}" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}`
  );

  // Big font-medium numbers standalone
  content = content.replace(
    /className="text-xl font-medium text-white"/g,
    'style={{ fontSize: \'2rem\', fontWeight: 200, letterSpacing: \'-0.02em\', color: tokens.text }}'
  );

  // Section headers: text-lg font-medium text-white
  content = content.replace(
    /className="text-lg font-medium text-white mb-6"/g,
    'style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.text, marginBottom: \'1.5rem\' }}'
  );
  content = content.replace(
    /className="text-lg font-medium text-white mb-4"/g,
    'style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.text, marginBottom: \'1rem\' }}'
  );
  content = content.replace(
    /className="text-lg font-medium text-white"/g,
    'style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.text }}'
  );

  // Modal headers: text-xl sm:text-2xl font-medium text-white
  content = content.replace(
    /className="text-xl sm:text-2xl font-medium text-white mb-1"/g,
    'style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.text, marginBottom: \'0.25rem\' }}'
  );
  content = content.replace(
    /className="text-xl sm:text-2xl font-medium text-white mb-2"/g,
    'style={{ fontSize: \'0.7rem\', letterSpacing: \'0.15em\', textTransform: \'uppercase\' as const, fontWeight: 400, color: tokens.text, marginBottom: \'0.5rem\' }}'
  );

  // Buttons: bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg
  content = content.replace(
    /className="flex items-center gap-2 px-4 py-2 bg-white\/10 border border-white\/10 hover:bg-white\/15 text-white rounded-lg transition-colors font-medium"/g,
    'className="flex items-center gap-2 transition-all" style={{ background: \'transparent\', border: `1px solid ${tokens.cardBorder}`, color: tokens.text, padding: \'0.75rem 1.5rem\', letterSpacing: \'0.08em\', textTransform: \'uppercase\' as const, fontSize: \'0.75rem\', borderRadius: \'4px\' }}'
  );

  // Dividers: divide-y divide-white/10
  content = content.replace(/divide-y divide-white\/10/g, 'divide-y');
  content = content.replace(/divide-y divide-white\/5/g, 'divide-y');

  // Table header text
  content = content.replace(
    /className="[^"]*text-xs font-medium text-white\/50 uppercase tracking-wider"/g,
    'style={{ fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, fontWeight: 400 }}'
  );

  // Background overlay for modals
  content = content.replace(
    /className="fixed inset-0 bg-black\/70 flex items-center justify-center z-50 p-4"/g,
    'className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: \'rgba(0,0,0,0.7)\' }}'
  );

  // Simple text color replacements where safe
  content = content.replace(/className="text-sm font-medium text-white"/g, 'className="text-sm font-medium" style={{ color: tokens.text }}');
  content = content.replace(/className="text-xs text-white\/50"/g, 'className="text-xs" style={{ color: tokens.textMuted }}');
  content = content.replace(/className="text-xs text-white\/40"/g, 'className="text-xs" style={{ color: tokens.textMuted }}');
  content = content.replace(/className="text-sm text-white\/70"/g, 'className="text-sm" style={{ color: tokens.text }}');
  content = content.replace(/className="text-sm text-white\/50"/g, 'className="text-sm" style={{ color: tokens.textMuted }}');
  content = content.replace(/className="text-sm text-white\/40"/g, 'className="text-sm" style={{ color: tokens.textMuted }}');
  content = content.replace(/className="text-white\/50"/g, 'style={{ color: tokens.textMuted }}');
  content = content.replace(/className="text-white font-medium"/g, 'style={{ color: tokens.text, fontWeight: 500 }}');

  // Input fields: add premium underline style
  content = content.replace(
    /className="w-full pl-10 pr-4 py-2\.5 bg-white\/10 border border-white\/15 rounded-lg text-white placeholder-white\/30 focus:outline-none focus:ring-2 focus:ring-white\/30 focus:border-transparent"/g,
    'className="w-full pl-10 pr-4 py-2.5 focus:outline-none" style={{ background: \'transparent\', borderTop: \'none\', borderLeft: \'none\', borderRight: \'none\', borderBottom: `1px solid ${tokens.inputBorder}`, color: tokens.text, borderRadius: 0 }}'
  );
  content = content.replace(
    /className="w-full px-4 py-2\.5 bg-white\/10 border border-white\/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white\/30 focus:border-transparent"/g,
    'className="w-full px-4 py-2.5 focus:outline-none" style={{ background: \'transparent\', borderTop: \'none\', borderLeft: \'none\', borderRight: \'none\', borderBottom: `1px solid ${tokens.inputBorder}`, color: tokens.text, borderRadius: 0 }}'
  );

  // Labels for inputs
  content = content.replace(
    /className="block text-sm font-medium text-white\/50 mb-2"/g,
    'style={{ display: \'block\', fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'0.5rem\', fontWeight: 400 }}'
  );
  content = content.replace(
    /className="block text-sm font-medium text-white\/50 mb-3"/g,
    'style={{ display: \'block\', fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'0.75rem\', fontWeight: 400 }}'
  );

  // Section headers with uppercase already
  content = content.replace(
    /className="text-sm font-medium text-white\/40 uppercase tracking-wider mb-3"/g,
    'style={{ fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'0.75rem\', fontWeight: 400 }}'
  );
  content = content.replace(
    /className="text-sm font-medium text-white\/60 uppercase tracking-wider mb-4"/g,
    'style={{ fontSize: \'0.65rem\', letterSpacing: \'0.12em\', textTransform: \'uppercase\' as const, color: tokens.textMuted, marginBottom: \'1rem\', fontWeight: 400 }}'
  );

  // ─── Step 4: Add glass const if we used it ─────────────
  if (content.includes('...glass') && !content.includes('const glass =') && !content.includes('const glass =')) {
    content = addGlassConst(content);
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    modified++;
    console.log(`✓ ${filePath}`);
  } else {
    skipped++;
  }
}

console.log(`\nDone: ${modified} modified, ${skipped} skipped`);

// ─── Helper Functions ────────────────────────────────────

function addImportAfterLastImport(content, importLine) {
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
      lastImportIdx = i;
    }
    // Handle multi-line imports
    if (lastImportIdx >= 0 && !lines[lastImportIdx].includes(';') && !lines[lastImportIdx].includes("'")) {
      // Multi-line import, keep going until we find the closing
      if (lines[i].includes("';") || lines[i].includes("from '")) {
        lastImportIdx = i;
      }
    }
  }

  if (lastImportIdx === -1) return content;

  // Check if the line ends the import (has semicolon or quote)
  // Find the actual end of imports block
  for (let i = lastImportIdx; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("from '") || line.includes('from "') || line.endsWith(';')) {
      lastImportIdx = i;
      break;
    }
  }

  lines.splice(lastImportIdx + 1, 0, importLine);
  return lines.join('\n');
}

function addTokensInit(content, hasUseTheme) {
  // If useTheme already exists, find where isDark is destructured and add tokens after
  if (hasUseTheme) {
    if (content.includes('isDark')) {
      // Add tokens after the isDark line
      content = content.replace(
        /(const\s*\{[^}]*isDark[^}]*\}\s*=\s*useTheme\(\);?\s*\n)/,
        '$1  const tokens = getDesignTokens(isDark);\n'
      );
    } else {
      // useTheme exists but isDark not destructured - add both
      content = content.replace(
        /const\s*\{([^}]*)\}\s*=\s*useTheme\(\)/,
        (match, vars) => {
          if (!vars.includes('isDark')) {
            return `const { ${vars.trim()}, isDark } = useTheme()`;
          }
          return match;
        }
      );
      content = content.replace(
        /(const\s*\{[^}]*isDark[^}]*\}\s*=\s*useTheme\(\);?\s*\n)/,
        '$1  const tokens = getDesignTokens(isDark);\n'
      );
    }
  } else {
    // Need to add useTheme call + tokens init
    // Find the first useState or the component opening
    const match = content.match(/export default function \w+\([^)]*\)\s*\{/);
    if (match) {
      const idx = content.indexOf(match[0]) + match[0].length;
      const insert = '\n  const { isDark } = useTheme();\n  const tokens = getDesignTokens(isDark);\n';
      content = content.slice(0, idx) + insert + content.slice(idx);
    }
  }
  return content;
}

function addGlassConst(content) {
  // Add glass const after the tokens line
  const tokensLine = '  const tokens = getDesignTokens(isDark);';
  if (content.includes(tokensLine)) {
    content = content.replace(
      tokensLine,
      tokensLine + "\n  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '4px' } as const;"
    );
  }
  return content;
}
