'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Conteúdo de fallback a exibir quando ocorrer um erro */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary genérico para capturar erros de renderização.
 * Usar em layouts de route groups para isolar falhas.
 *
 * Uso:
 *   <ErrorBoundary>
 *     {children}
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<CustomErrorPage />}>
 *     {children}
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // @sentry/nextjs captura erros de React automaticamente quando instalado.
    // Não precisa de import/require aqui — a integração do Sentry intercepta
    // getDerivedStateFromError globalmente após Sentry.init().
    //
    // Para instalar: npm install @sentry/nextjs
    // Config: sentry.client.config.ts (já criado no projeto)
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Algo deu errado
            </h2>
            <p className="text-white/40 mb-6">
              Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Tentar Novamente
              </button>
              <a
                href="/inicio"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
              >
                Página Inicial
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
