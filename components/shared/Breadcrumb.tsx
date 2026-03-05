// ============================================================
// Breadcrumb — Lightweight breadcrumbs for deep pages
// ============================================================
// Auto-detects hierarchy from pathname. Shows max 3 levels.
// Mobile: simplified "← Voltar" button.
// Desktop: full breadcrumb trail with "›" separators.
//
// Usage:
//   <Breadcrumb />                          // auto-detect from pathname
//   <Breadcrumb dynamicLabel="Rafael" />     // override last segment label
//   <Breadcrumb items={[...]} />             // fully custom
// ============================================================
'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// ── Types ──

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  /** Override automatic detection with custom items */
  items?: BreadcrumbItem[];
  /** Override the label for the last (current) segment */
  dynamicLabel?: string;
  /** Additional className */
  className?: string;
}

// ── Route segment keys ──
// Lists all segments that have a translation key in navigation.routes.*
// The actual labels come from the translation files.

const ROUTE_SEGMENTS = [
  // Main
  'inicio', 'unidade', 'shop', 'produto', 'ranking', 'series', 'novidades',
  'minhas-turmas', 'minha-evolucao', 'meu-perfil-esportivo', 'meus-pagamentos',
  'perfil', 'configuracoes', 'permissoes-usuario', 'eventos', 'teste',
  // Instrutor
  'professor-dashboard', 'professor-alunos', 'professor-aluno-detalhe',
  'professor-turmas', 'professor-chamada', 'professor-avaliacoes',
  'professor-cronometro', 'professor-plano-aula', 'professor-videos',
  'professor-perfil', 'professor-particulares',
  // Admin
  'dashboard', 'turmas', 'usuarios', 'financeiro', 'comunicacoes', 'graduacoes',
  'analytics', 'automacoes', 'relatorios', 'alertas', 'agenda', 'check-in',
  'estoque', 'pagamentos', 'leads', 'comissoes', 'pdv', 'seguranca', 'permissoes',
  'recepcao', 'visitantes', 'particulares', 'gestao-eventos',
  // Parent
  'painel-responsavel', 'meus-filhos', 'progresso', 'autorizacoes', 'checkin',
  // Teen
  'teen-inicio', 'teen-aulas', 'teen-progresso', 'teen-conquistas', 'teen-perfil',
  'teen-academia', 'teen-checkin', 'teen-downloads',
  // Kids
  'kids-inicio', 'kids-aulas', 'kids-desafios', 'kids-medalhas', 'kids-mestres',
] as const;

// ── Route group → root mapping ──
// Label keys reference navigation.routes.* translations.

const GROUP_ROOT_CONFIG: Record<string, { labelKey: string; href: string }> = {
  'inicio': { labelKey: 'inicio', href: '/inicio' },
  'academia': { labelKey: 'inicio', href: '/inicio' },
  'shop': { labelKey: 'inicio', href: '/inicio' },
  'perfil': { labelKey: 'inicio', href: '/inicio' },
  'ranking': { labelKey: 'inicio', href: '/inicio' },
  'professor-aluno-detalhe': { labelKey: 'professor-alunos', href: '/professor-alunos' },
  'professor-alunos': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-turmas': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-chamada': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-avaliacoes': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-cronometro': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-plano-aula': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-videos': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'professor-perfil': { labelKey: 'dashboard', href: '/professor-dashboard' },
  'painel-responsavel': { labelKey: 'painel-responsavel', href: '/painel-responsavel' },
  'meus-filhos': { labelKey: 'painel-responsavel', href: '/painel-responsavel' },
};

// ── Helpers ──

function isUUID(segment: string): boolean {
  return /^[a-f0-9-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
}

// ══════════════════════════════════════════════════════════════

export function Breadcrumb({ items: customItems, dynamicLabel, className = '' }: BreadcrumbProps) {
  const tActions = useTranslations('common.actions');
  const tRoutes = useTranslations('navigation.routes');
  const pathname = usePathname();
  const router = useRouter();

  const getSegmentLabel = (segment: string): string => {
    if ((ROUTE_SEGMENTS as readonly string[]).includes(segment)) {
      return tRoutes(segment);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
  };

  const getGroupRoot = (segment: string): BreadcrumbItem | null => {
    const cfg = GROUP_ROOT_CONFIG[segment];
    if (!cfg) return null;
    return { label: tRoutes(cfg.labelKey), href: cfg.href };
  };

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    if (customItems) return customItems;

    // Strip route group prefixes like (main), (professor), etc.
    const clean = pathname.replace(/\/\([^)]+\)/g, '');
    const segments = clean.split('/').filter(Boolean);

    if (segments.length <= 1) return []; // No breadcrumbs for root pages

    const items: BreadcrumbItem[] = [];

    // Add root based on first segment
    const firstSeg = segments[0];
    const root = getGroupRoot(firstSeg);
    if (root) items.push(root);

    // Build path incrementally
    let path = '';
    segments.forEach((seg, i) => {
      path += '/' + seg;
      const isLast = i === segments.length - 1;

      // Skip if already added as root
      if (i === 0 && root && getSegmentLabel(seg) === root.label) return;

      // Dynamic segments (UUIDs, IDs)
      if (isUUID(seg)) {
        if (isLast && dynamicLabel) {
          items.push({ label: dynamicLabel });
        }
        // Skip unlabeled dynamic segments
        return;
      }

      const label = isLast && dynamicLabel ? dynamicLabel : getSegmentLabel(seg);
      items.push(isLast ? { label } : { label, href: path });
    });

    // Collapse to max 3 items: [first, ..., last]
    if (items.length > 3) {
      return [items[0], { label: '…' }, items[items.length - 1]];
    }

    return items;
  }, [pathname, customItems, dynamicLabel, tRoutes]);

  // Don't render if only 0-1 items
  if (breadcrumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-3 ${className}`}>
      {/* Mobile: simplified back button */}
      <button
        onClick={() => router.back()}
        className="md:hidden flex items-center gap-1.5 text-white/35 hover:text-white/60 text-xs transition-colors py-1"
        aria-label={tActions('back')}
      >
        <ArrowLeft size={14} />
        <span>{breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].label : tActions('back')}</span>
      </button>

      {/* Desktop: full breadcrumb trail */}
      <ol className="hidden md:flex items-center gap-1 text-xs text-white/35">
        {breadcrumbs.map((item, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/15 mx-0.5">›</span>}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); router.push(item.href!); }}
                  className="hover:text-white/60 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? 'text-white/55 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
