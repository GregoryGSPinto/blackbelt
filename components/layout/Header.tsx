'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { UserAccountMenu } from '@/components/shared/UserAccountMenu';

/**
 * Header Desktop — altura dobrada (h-[120px]), logo leão, itens centralizados
 * Escopo: hidden md:flex (zero impacto mobile)
 */
export default function Header() {
  const t = useTranslations('common');
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const showBackButton = pathname !== '/inicio';

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="hidden md:flex items-center justify-between px-8 bg-black/60 backdrop-blur-xl border-b border-white/10 h-[120px]">
      <div className="flex-1 flex items-center gap-6">
        {/* Logo Leão + Texto */}
        <Link href="/inicio" className="flex items-center gap-3.5 flex-shrink-0 group">
          <Image
            src="/images/logo-blackbelt.png"
            alt="BlackBelt"
            width={36}
            height={36}
            className="flex-shrink-0 object-contain rounded-lg ring-1 ring-white/[0.06] group-hover:ring-white/15 transition-all duration-300"
            priority
          />
          <span className="text-[15px] font-medium tracking-wide text-white/90">
            BLACKBELT
          </span>
        </Link>

        {/* Separador visual */}
        <div className="w-px h-10 bg-white/10 flex-shrink-0" />

        {/* Botão Voltar */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 group"
            title={t('actions.back')}
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">{t('actions.back')}</span>
          </button>
        )}

        <p className="text-base">
          {t('greeting.welcome')} <span className="font-medium text-white">{user?.nome}</span> 🥋
        </p>
      </div>

      {/* User Account Menu — REUSABLE */}
      <UserAccountMenu variant="dark" />
    </header>
  );
}
