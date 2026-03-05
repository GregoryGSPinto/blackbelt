'use client';

import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTranslations } from 'next-intl';

export function CadastroLoading() {
  const t = useTranslations('auth');
  return <PremiumLoader text={t('register.creatingAccount')} />;
}
