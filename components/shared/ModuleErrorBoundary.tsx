'use client';

import { Component, ReactNode } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  Shield,
  Sparkles,
  Baby,
  Users,
  GraduationCap,
  BookOpen
} from 'lucide-react';

/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  MODULE ERROR BOUNDARY - ISOLAMENTO POR DOMÍNIO           ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * ARQUITETURA DE RESILIÊNCIA MODULAR
 * -----------------------------------
 * Este componente garante que erros em um route group NÃO derrubam
 * o sistema inteiro. Cada domínio tem seu próprio Error Boundary isolado.
 * 
 * CARACTERÍSTICAS:
 * ✓ Isolamento total por módulo
 * ✓ Fallback elegante com contexto visual do módulo
 * ✓ Logging estruturado para monitoramento
 * ✓ Zero impacto em AuthContext
 * ✓ Zero impacto em navegação global
 * ✓ Recuperação contextual por domínio
 * 
 * CASOS DE USO:
 * 1. Se Kids falhar → Admin continua funcionando
 * 2. Se Admin falhar → Alunos adultos não são afetados
 * 3. Se Teen falhar → Parents e outros módulos intactos
 * 
 * EXEMPLO DE USO:
 * ```tsx
 * // Em app/(kids)/layout.tsx
 * <ModuleErrorBoundary moduleName="KIDS">
 *   {children}
 * </ModuleErrorBoundary>
 * ```
 */

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE MÓDULOS
// ═══════════════════════════════════════════════════════════

export type ModuleName = 'ADMIN' | 'MAIN' | 'KIDS' | 'TEEN' | 'PARENT' | 'INSTRUTOR';

interface ModuleConfig {
  /** Nome para exibição */
  displayName: string;
  /** Ícone do módulo */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  /** Gradiente de cores */
  gradient: string;
  /** Cor do ícone */
  iconColor: string;
  /** Cor do badge de status */
  badgeColor: string;
  /** Rota de recuperação (home do módulo) */
  homeRoute: string;
  /** Mensagem personalizada */
  message: string;
  /** Emoji decorativo */
  emoji: string;
}

const MODULE_CONFIG: Record<ModuleName, ModuleConfig> = {
  ADMIN: {
    displayName: 'Painel Administrativo',
    icon: Shield,
    gradient: 'from-dark-bg via-dark-card to-dark-bg',
    iconColor: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    homeRoute: '/dashboard',
    message: 'O módulo administrativo encontrou um problema inesperado.',
    emoji: '🛡️'
  },
  MAIN: {
    displayName: 'Área do Aluno',
    icon: GraduationCap,
    gradient: 'from-black via-purple-950 to-black',
    iconColor: 'text-purple-400',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    homeRoute: '/inicio',
    message: 'A área do aluno encontrou um problema inesperado.',
    emoji: '🥋'
  },
  KIDS: {
    displayName: 'Área Kids',
    icon: Baby,
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
    iconColor: 'text-yellow-300',
    badgeColor: 'bg-yellow-400/20 text-yellow-200 border-yellow-300/30',
    homeRoute: '/kids-inicio',
    message: 'Ops! Algo deu errado na área Kids.',
    emoji: '🌟'
  },
  TEEN: {
    displayName: 'Área Teen',
    icon: Sparkles,
    gradient: 'from-cyan-600 via-blue-600 to-purple-600',
    iconColor: 'text-cyan-300',
    badgeColor: 'bg-cyan-400/20 text-cyan-200 border-cyan-300/30',
    homeRoute: '/teen-inicio',
    message: 'A área teen encontrou um problema inesperado.',
    emoji: '⚡'
  },
  PARENT: {
    displayName: 'Área Responsável',
    icon: Users,
    gradient: 'from-indigo-900 via-purple-900 to-pink-900',
    iconColor: 'text-pink-300',
    badgeColor: 'bg-pink-400/20 text-pink-200 border-pink-300/30',
    homeRoute: '/parent-inicio',
    message: 'A área do responsável encontrou um problema inesperado.',
    emoji: '👨‍👩‍👧'
  },
  INSTRUTOR: {
    displayName: 'Área do Instrutor',
    icon: BookOpen,
    gradient: 'from-dark-bg via-blue-950 to-dark-bg',
    iconColor: 'text-blue-300',
    badgeColor: 'bg-blue-400/20 text-blue-200 border-blue-300/30',
    homeRoute: '/professor-dashboard',
    message: 'A área do instrutor encontrou um problema inesperado.',
    emoji: '📚'
  }
};

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════

interface Props {
  /** Nome do módulo para identificação */
  moduleName: ModuleName;
  /** Conteúdo protegido */
  children: ReactNode;
  /** Fallback customizado (opcional) */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  timestamp: Date | null;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export class ModuleErrorBoundary extends Component<Props, State> {
  private config: ModuleConfig;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null
    };
    this.config = MODULE_CONFIG[props.moduleName];
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      timestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ═══════════════════════════════════════════════════════════
    // LOGGING ESTRUTURADO
    // ═══════════════════════════════════════════════════════════
    const logData = {
      module: this.props.moduleName,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // Log estruturado via logger centralizado
    logger.errorGroup(`MODULE ERROR - ${this.props.moduleName}`, error, logData);

    // @sentry/nextjs captura erros de React automaticamente quando instalado.
    // Config: sentry.client.config.ts (PII filter + LGPD compliance)
    // Quando instalado, o Sentry intercepta este componentDidCatch globalmente.

    this.setState({
      errorInfo,
      timestamp: new Date()
    });
  }

  handleRetry = () => {
    logger.info('[ErrorBoundary]', `Retry iniciado - Módulo: ${this.props.moduleName}`);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: null
    });
  };

  render() {
    const { hasError, error, timestamp } = this.state;
    const { children, fallback } = this.props;

    // ═══════════════════════════════════════════════════════════
    // RENDERIZAÇÃO NORMAL
    // ═══════════════════════════════════════════════════════════
    if (!hasError) {
      return children;
    }

    // ═══════════════════════════════════════════════════════════
    // FALLBACK CUSTOMIZADO
    // ═══════════════════════════════════════════════════════════
    if (fallback) {
      return fallback;
    }

    // ═══════════════════════════════════════════════════════════
    // FALLBACK PREMIUM PADRÃO
    // ═══════════════════════════════════════════════════════════
    const Icon = this.config.icon;

    return (
      <div className={`min-h-screen bg-gradient-to-br ${this.config.gradient} flex items-center justify-center p-6`}>
        <div className="w-full max-w-2xl">
          {/* ═══════════════════════════════════════════════════ */}
          {/* CARD PRINCIPAL */}
          {/* ═══════════════════════════════════════════════════ */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div>
            
            {/* Card */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
              {/* ═══════════════════════════════════════════════ */}
              {/* HEADER */}
              {/* ═══════════════════════════════════════════════ */}
              <div className="flex items-start gap-6 mb-8">
                {/* Ícone */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon size={40} className={this.config.iconColor} />
                  </div>
                </div>

                {/* Texto */}
                <div className="flex-1">
                  {/* Badge Status */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-3 ${this.config.badgeColor}`}>
                    <AlertTriangle size={14} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Erro no Módulo
                    </span>
                  </div>

                  {/* Título */}
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <span>{this.config.emoji}</span>
                    <span>{this.config.displayName}</span>
                  </h1>

                  {/* Subtítulo */}
                  <p className="text-lg text-white/70 leading-relaxed">
                    {this.config.message}
                  </p>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════ */}
              {/* INFORMAÇÕES TÉCNICAS */}
              {/* ═══════════════════════════════════════════════ */}
              <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
                <div className="grid gap-3">
                  {/* Erro */}
                  <div>
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">
                      Erro
                    </p>
                    <p className="text-sm text-white/90 font-mono break-all">
                      {error?.message || 'Erro desconhecido'}
                    </p>
                  </div>

                  {/* Módulo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">
                        Módulo
                      </p>
                      <p className="text-sm text-white/90 font-semibold">
                        {this.props.moduleName}
                      </p>
                    </div>

                    {/* Timestamp */}
                    {timestamp && (
                      <div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1">
                          Horário
                        </p>
                        <p className="text-sm text-white/90 font-mono">
                          {timestamp.toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════ */}
              {/* TRANQUILIZAÇÃO */}
              {/* ═══════════════════════════════════════════════ */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-8">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-green-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-300 mb-1">
                      Sistema Protegido
                    </p>
                    <p className="text-xs text-green-200/80 leading-relaxed">
                      Este erro está <strong>isolado</strong> a este módulo. 
                      Outros módulos continuam funcionando normalmente. 
                      Sua sessão e dados estão seguros.
                    </p>
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════ */}
              {/* AÇÕES */}
              {/* ═══════════════════════════════════════════════ */}
              <div className="grid md:grid-cols-2 gap-3">
                {/* Tentar Novamente */}
                <button
                  onClick={this.handleRetry}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw 
                    size={20} 
                    className="text-white/80 group-hover:text-white group-hover:rotate-180 transition-all duration-500" 
                  />
                  <span className="text-sm font-bold text-white">
                    Tentar Novamente
                  </span>
                </button>

                {/* Ir para Home */}
                <Link
                  href={this.config.homeRoute}
                  className="group flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-white/95 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Home 
                    size={20} 
                    className="text-gray-900 group-hover:scale-110 transition-transform" 
                  />
                  <span className="text-sm font-bold text-gray-900">
                    Ir para Início
                  </span>
                </Link>
              </div>

              {/* ═══════════════════════════════════════════════ */}
              {/* RODAPÉ */}
              {/* ═══════════════════════════════════════════════ */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-center text-white/40">
                  Se o problema persistir, entre em contato com o suporte técnico
                </p>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════ */}
          {/* DETALHES TÉCNICOS (dev mode) */}
          {/* ═══════════════════════════════════════════════════ */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 bg-black/60 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-400" />
                <h3 className="text-sm font-bold text-red-300 uppercase tracking-wide">
                  Dev Mode - Stack Trace
                </h3>
              </div>
              <pre className="text-xs text-red-200/80 font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {error?.stack}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ModuleErrorBoundary;
