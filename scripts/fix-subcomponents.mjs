#!/usr/bin/env node
/**
 * Fix sub-components that reference `tokens` without having their own hooks.
 * Adds useTheme + getDesignTokens to each sub-component function that uses tokens.
 */
import { readFileSync, writeFileSync } from 'fs';

const files = [
  'app/(admin)/analytics/page.tsx',
  'app/(admin)/automacoes/page.tsx',
  'app/(admin)/dashboard/page.tsx',
  'app/(admin)/gestao-eventos/page.tsx',
  'app/(admin)/graduacoes/page.tsx',
  'app/(admin)/seguranca/page.tsx',
  'app/(main)/eventos/[id]/page.tsx',
  'app/(main)/inicio/page.tsx',
  'app/(main)/ranking/page.tsx',
  'app/(professor)/professor-aluno-detalhe/page.tsx',
];

for (const filePath of files) {
  let content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const insertions = []; // {lineIndex, indent}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match standalone sub-component functions (not export default)
    const match = line.match(/^function\s+\w+\s*\(/);
    if (match && !line.includes('export')) {
      // Check if any subsequent line in this function uses tokens.
      let braceCount = 0;
      let started = false;
      let usesTokens = false;

      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') { braceCount++; started = true; }
          if (ch === '}') braceCount--;
        }
        if (lines[j].includes('tokens.')) usesTokens = true;
        if (started && braceCount === 0) break;
      }

      if (usesTokens) {
        // Check if this function already has useTheme/tokens
        let hasTokens = false;
        let bodyStart = -1;
        let bc = 0;
        let s = false;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === '{') { bc++; s = true; }
            if (ch === '}') bc--;
          }
          if (s && bc >= 1 && bodyStart === -1) {
            bodyStart = j;
          }
          if (lines[j].includes('const tokens') || lines[j].includes('getDesignTokens')) {
            hasTokens = true;
            break;
          }
          if (s && bc === 0) break;
        }

        if (!hasTokens && bodyStart >= 0) {
          // Find the line with the opening brace
          let braceLineIdx = i;
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes('{')) {
              braceLineIdx = j;
              break;
            }
          }
          insertions.push(braceLineIdx);
        }
      }
    }
  }

  if (insertions.length === 0) continue;

  // Insert from bottom to top to preserve line numbers
  const hookLines = "  const { isDark } = useTheme();\n  const tokens = getDesignTokens(isDark);";

  for (const lineIdx of insertions.reverse()) {
    const line = lines[lineIdx];
    const braceIdx = line.indexOf('{');
    if (braceIdx >= 0) {
      // Insert after the line with opening brace
      lines.splice(lineIdx + 1, 0, hookLines);
    }
  }

  content = lines.join('\n');
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ ${filePath} (${insertions.length} sub-components fixed)`);
}

console.log('Done');
