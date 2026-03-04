'use client';

import CinematicBackground from '@/components/ui/CinematicBackground';
import { PremiumLoader } from '@/components/shared/PremiumLoader';

export function CadastroLoading() {
  return <PremiumLoader text="Criando sua conta..." />;
}
