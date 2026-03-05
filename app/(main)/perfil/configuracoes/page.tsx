'use client';

import { ConfiguracoesContent } from '@/features/perfil/configuracoes';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function ConfiguracoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  return <ConfiguracoesContent />;
}
