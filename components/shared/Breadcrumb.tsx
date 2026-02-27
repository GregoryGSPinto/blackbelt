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

// ── Route label mapping ──
// Maps pathname segments to human-readable labels.

const ROUTE_LABELS: Record<string, string> = {
  // Main
  'inicio': 'Início',
  'unidade': 'Unidades',
  'shop': 'Loja',
  'produto': 'Produto',
  'ranking': 'Ranking',
  'series': 'Séries',
  'novidades': 'Novidades',
  'minhas-turmas': 'Minhas Turmas',
  'minha-evolucao': 'Minha Evolução',
  'meu-perfil-esportivo': 'Perfil Esportivo',
  'meus-pagamentos': 'Pagamentos',
  'perfil': 'Perfil',
  'configuracoes': 'Configurações',
  'permissoes-usuario': 'Permissões',
  'eventos': 'Eventos',
  'teste': 'Teste',
  // Instrutor
  'professor-dashboard': 'Dashboard',
  'professor-alunos': 'Alunos',
  'professor-aluno-detalhe': 'Detalhe do Aluno',
  'professor-turmas': 'Turmas',
  'professor-chamada': 'Chamada',
  'professor-avaliacoes': 'Avaliações',
  'professor-cronometro': 'Cronômetro',
  'professor-plano-aula': 'Plano de Sessão',
  'professor-videos': 'Vídeos',
  'professor-perfil': 'Perfil',
  'professor-particulares': 'Particulares',
  // Admin
  'dashboard': 'Dashboard',
  'turmas': 'Turmas',
  'usuarios': 'Usuários',
  'financeiro': 'Financeiro',
  'comunicacoes': 'Comunicações',
  'graduacoes': 'Graduações',
  'analytics': 'Analytics',
  'automacoes': 'Automações',
  'relatorios': 'Relatórios',
  'alertas': 'Alertas',
  'agenda': 'Agenda',
  'check-in': 'Check-in',
  'estoque': 'Estoque',
  'pagamentos': 'Pagamentos',
  'leads': 'Leads',
  'comissoes': 'Comissões',
  'pdv': 'PDV',
  'seguranca': 'Segurança',
  'permissoes': 'Permissões',
  'recepcao': 'Recepção',
  'visitantes': 'Visitantes',
  'particulares': 'Particulares',
  'gestao-eventos': 'Eventos',
  // Parent
  'painel-responsavel': 'Painel',
  'meus-filhos': 'Meus Filhos',
  'progresso': 'Progresso',
  'autorizacoes': 'Autorizações',
  'checkin': 'Check-in',
  // Teen
  'teen-inicio': 'Início',
  'teen-aulas': 'Sessões',
  'teen-progresso': 'Progresso',
  'teen-conquistas': 'Conquistas',
  'teen-perfil': 'Perfil',
  'teen-academia': 'Unidade',
  'teen-checkin': 'Check-in',
  'teen-downloads': 'Downloads',
  // Kids
  'kids-inicio': 'Início',
  'kids-aulas': 'Sessões',
  'kids-desafios': 'Desafios',
  'kids-medalhas': 'Conquistas',
  'kids-mestres': 'Mestres',
};

// ── Route group → root mapping ──

const GROUP_ROOTS: Record<string, BreadcrumbItem> = {
  'inicio': { label: 'Início', href: '/inicio' },
  'academia': { label: 'Início', href: '/inicio' },
  'shop': { label: 'Início', href: '/inicio' },
  'perfil': { label: 'Início', href: '/inicio' },
  'ranking': { label: 'Início', href: '/inicio' },
  'professor-aluno-detalhe': { label: 'Alunos', href: '/professor-alunos' },
  'professor-alunos': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-turmas': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-chamada': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-avaliacoes': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-cronometro': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-plano-aula': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-videos': { label: 'Dashboard', href: '/professor-dashboard' },
  'professor-perfil': { label: 'Dashboard', href: '/professor-dashboard' },
  'painel-responsavel': { label: 'Painel', href: '/painel-responsavel' },
  'meus-filhos': { label: 'Painel', href: '/painel-responsavel' },
};

// ── Helpers ──

function isUUID(segment: string): boolean {
  return /^[a-f0-9-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
}

function getSegmentLabel(segment: string): string {
  return ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

// ══════════════════════════════════════════════════════════════

export function Breadcrumb({ items: customItems, dynamicLabel, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();

  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    if (customItems) return customItems;

    // Strip route group prefixes like (main), (professor), etc.
    const clean = pathname.replace(/\/\([^)]+\)/g, '');
    const segments = clean.split('/').filter(Boolean);

    if (segments.length <= 1) return []; // No breadcrumbs for root pages

    const items: BreadcrumbItem[] = [];

    // Add root based on first segment
    const firstSeg = segments[0];
    const root = GROUP_ROOTS[firstSeg];
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
  }, [pathname, customItems, dynamicLabel]);

  // Don't render if only 0-1 items
  if (breadcrumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-3 ${className}`}>
      {/* Mobile: simplified back button */}
      <button
        onClick={() => router.back()}
        className="md:hidden flex items-center gap-1.5 text-white/35 hover:text-white/60 text-xs transition-colors py-1"
        aria-label="Voltar"
      >
        <ArrowLeft size={14} />
        <span>{breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].label : 'Voltar'}</span>
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
