'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, Calendar, Zap } from 'lucide-react';

// Mock status - em produção viria do backend
const MOCK_STATUS = 'ativo'; // 'ativo' | 'atraso' | 'bloqueado'

const statusConfig = {
  ativo: {
    badge: {
      icon: CheckCircle,
      text: 'LIBERADO',
      emoji: '✅',
      color: 'green',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-600',
      iconBg: 'bg-green-600',
    },
    message: 'Seu acesso está ok! Você pode treinar normalmente.',
    training: {
      available: true,
      text: 'Pode treinar!',
      description: 'Bora fazer o check-in e partir pro treino! 💪',
    },
  },
  atraso: {
    badge: {
      icon: AlertCircle,
      text: 'PENDENTE',
      emoji: '⚠️',
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-600',
      iconBg: 'bg-yellow-600',
    },
    message: 'Há uma pendência no seu acesso. Fala com a recepção pra resolver!',
    training: {
      available: false,
      text: 'Não pode treinar ainda',
      description: 'Resolve com a recepção e volta logo!',
    },
  },
  bloqueado: {
    badge: {
      icon: XCircle,
      text: 'BLOQUEADO',
      emoji: '🔒',
      color: 'red',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      textColor: 'text-red-600',
      iconBg: 'bg-red-600',
    },
    message: 'Seu acesso está bloqueado no momento. Fala com a recepção pra saber mais!',
    training: {
      available: false,
      text: 'Não disponível',
      description: 'Resolve com a recepção!',
    },
  },
};

const historico = [
  { month: 'Fev 2026', status: 'ativo', date: '07/02', color: 'green', emoji: '✅' },
  { month: 'Jan 2026', status: 'ativo', date: '05/01', color: 'green', emoji: '✅' },
  { month: 'Dez 2025', status: 'atraso', date: '28/12', color: 'yellow', emoji: '⚠️' },
  { month: 'Nov 2025', status: 'ativo', date: '03/11', color: 'green', emoji: '✅' },
  { month: 'Out 2025', status: 'ativo', date: '02/10', color: 'green', emoji: '✅' },
  { month: 'Set 2025', status: 'ativo', date: '01/09', color: 'green', emoji: '✅' },
];

export default function TeenCheckinFinanceiroPage() {
  const [checkinDone, setCheckinDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentStatus = statusConfig[MOCK_STATUS as keyof typeof statusConfig];
  const StatusIcon = currentStatus.badge.icon;

  const handleCheckin = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCheckinDone(true);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teen-ocean/10 via-white to-teen-purple/10 pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-teen-ocean font-teen mb-2">Seu Acesso 🎯</h1>
          <p className="teen-text-muted font-teen">Veja seu status e faça o check-in!</p>
        </div>

        {/* Status Atual */}
        <div className="teen-card rounded-2xl p-6 shadow-lg border-2 border-transparent">
          <p className="text-sm font-bold teen-text-muted uppercase tracking-wider mb-4 font-teen">
            Status do Seu Acesso
          </p>
          
          <div className={`${currentStatus.badge.bgColor} border-2 ${currentStatus.badge.borderColor} rounded-2xl p-6 mb-4`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${currentStatus.badge.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <StatusIcon size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{currentStatus.badge.emoji}</span>
                  <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-black ${currentStatus.badge.textColor} font-teen`}>
                    {currentStatus.badge.text}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-base teen-text-body font-teen">
            {currentStatus.message}
          </p>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Treino de Hoje */}
          <div className="teen-card rounded-2xl p-5 shadow-md border-2 border-transparent">
            <p className="text-sm font-bold teen-text-muted uppercase tracking-wider mb-3 font-teen">
              Treino de Hoje
            </p>
            <div className="flex items-center gap-2 mb-2">
              {currentStatus.training.available ? (
                <CheckCircle size={28} className="text-green-500" />
              ) : (
                <XCircle size={28} className="text-gray-400" />
              )}
              <span className={`text-xl font-black font-teen ${currentStatus.training.available ? 'text-green-600' : 'text-gray-500'}`}>
                {currentStatus.training.text}
              </span>
            </div>
            <p className="text-sm teen-text-muted font-teen">
              {currentStatus.training.description}
            </p>
          </div>

          {/* Última Validação */}
          <div className="teen-card rounded-2xl p-5 shadow-md border-2 border-transparent">
            <p className="text-sm font-bold teen-text-muted uppercase tracking-wider mb-3 font-teen">
              Última Verificação
            </p>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-teen-ocean" />
              <span className="text-xl font-black text-teen-ocean font-teen">07/02/2026</span>
            </div>
            <div className="flex items-center gap-2 text-sm teen-text-muted font-teen">
              <Clock size={16} />
              <span>às 08:30</span>
            </div>
          </div>
        </div>

        {/* Botão Check-in */}
        <div className="teen-card rounded-2xl p-6 shadow-lg border-2 border-transparent">
          {currentStatus.training.available ? (
            checkinDone ? (
              <button
                disabled
                className="w-full py-5 bg-green-500/20 border-2 border-green-500 rounded-xl text-green-600 text-lg font-black font-teen cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle size={24} />
                  <span>✓ JÁ FEZ CHECK-IN HOJE!</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleCheckin}
                disabled={isProcessing}
                className="w-full py-5 bg-gradient-to-r from-teen-ocean to-teen-purple hover:from-teen-ocean/90 hover:to-teen-purple/90 rounded-xl text-white text-lg font-black font-teen transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>REGISTRANDO...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={24} />
                      <span>FAZER CHECK-IN AGORA!</span>
                    </>
                  )}
                </div>
              </button>
            )
          ) : (
            <>
              <button
                disabled
                className="w-full py-5 bg-gray-200 border-2 border-gray-300 rounded-xl text-gray-500 text-lg font-black font-teen cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <XCircle size={24} />
                  <span>CHECK-IN NÃO DISPONÍVEL</span>
                </div>
              </button>
              
              <div className="mt-4 p-4 bg-teen-lightning/20 border-2 border-teen-lightning/40 rounded-xl">
                <p className="text-sm text-teen-ocean font-teen font-bold text-center">
                  ℹ️ Fala com a recepção pra resolver! Você volta logo ao ambiente! 💪
                </p>
              </div>
            </>
          )}

          {checkinDone && (
            <div className="mt-4 p-4 bg-green-500/20 border-2 border-green-500 rounded-xl animate-fade-in">
              <p className="text-center text-green-600 font-black font-teen mb-2 text-lg">
                ✓ Check-in feito!
              </p>
              <p className="text-center text-sm teen-text-muted font-teen">
                Registrado hoje às 09:15 • Bom treino! 🥋
              </p>
            </div>
          )}
        </div>

        {/* Histórico */}
        <div className="teen-card rounded-2xl p-6 shadow-lg border-2 border-transparent">
          <div className="mb-5">
            <h2 className="text-xl font-black text-teen-ocean font-teen mb-1">Histórico 📊</h2>
            <p className="text-sm teen-text-muted font-teen">Últimos 6 meses</p>
          </div>

          <div className="space-y-3">
            {historico.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-3 border-b-2 border-transparent last:border-0"
              >
                <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="teen-text-heading font-bold font-teen">{item.month}</span>
                    <span className={`text-sm font-bold font-teen ${
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {item.status === 'ativo' ? 'OK' : item.status === 'atraso' ? 'PENDENTE' : 'BLOQUEADO'}
                    </span>
                  </div>
                  <span className="text-sm teen-text-muted font-teen">
                    {item.status === 'ativo' ? 'Tudo certo em' : 'Resolvido em'} {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
