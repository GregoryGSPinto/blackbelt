'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, AlertCircle, XCircle, CheckSquare, Clock, Calendar, QrCode } from 'lucide-react';
import { QRGenerator } from '@/components/checkin/QRGenerator';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

// Mock status - em produção viria do backend
const MOCK_STATUS = 'ativo'; // 'ativo' | 'atraso' | 'bloqueado'

const statusConfig = {
  ativo: {
    badge: {
      icon: CheckCircle,
      text: 'ATIVO',
      color: 'green',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-600',
      textColor: 'text-green-400',
      iconBg: 'bg-green-600',
    },
    message: 'Seu acesso está regular e você pode treinar normalmente.',
    training: {
      available: true,
      text: 'Liberado',
      description: 'Você pode fazer check-in e treinar normalmente hoje.',
    },
  },
  atraso: {
    badge: {
      icon: AlertCircle,
      text: 'EM ATRASO',
      color: 'yellow',
      bgColor: 'bg-yellow-600/20',
      borderColor: 'border-yellow-600',
      textColor: 'text-yellow-400',
      iconBg: 'bg-yellow-600',
    },
    message: 'Há pendências em seu acesso. Procure a recepção para regularizar.',
    training: {
      available: false,
      text: 'Indisponível',
      description: 'Check-in não disponível no momento.',
    },
  },
  bloqueado: {
    badge: {
      icon: XCircle,
      text: 'BLOQUEADO',
      color: 'red',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-600',
      textColor: 'text-red-400',
      iconBg: 'bg-red-600',
    },
    message: 'Seu acesso está temporariamente indisponível. Procure a recepção para mais informações.',
    training: {
      available: false,
      text: 'Indisponível',
      description: 'Check-in não disponível no momento.',
    },
  },
};

const historico = [
  { month: 'Fev 2026', status: 'ativo', date: '07/02/2026', color: 'green' },
  { month: 'Jan 2026', status: 'ativo', date: '05/01/2026', color: 'green' },
  { month: 'Dez 2025', status: 'atraso', date: '28/12/2025', color: 'yellow' },
  { month: 'Nov 2025', status: 'ativo', date: '03/11/2025', color: 'green' },
  { month: 'Out 2025', status: 'ativo', date: '02/10/2025', color: 'green' },
  { month: 'Set 2025', status: 'ativo', date: '01/09/2025', color: 'green' },
];

export default function CheckinFinanceiroPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [checkinDone, setCheckinDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const currentStatus = statusConfig[MOCK_STATUS as keyof typeof statusConfig];
  const StatusIcon = currentStatus.badge.icon;

  const handleCheckin = async () => {
    setIsProcessing(true);
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCheckinDone(true);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>Check-in / Financeiro</h1>
          <p className="text-white/60">Seu status de acesso e check-in diário</p>
        </div>

        {/* Status Atual */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-8">
          <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Status Atual do Seu Acesso
          </p>
          
          <div className={`${currentStatus.badge.bgColor} border-2 ${currentStatus.badge.borderColor} rounded-2xl p-6 mb-6`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${currentStatus.badge.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <StatusIcon size={24} className="text-white" />
              </div>
              <span className={`text-3xl font-black ${currentStatus.badge.textColor}`}>
                {currentStatus.badge.text}
              </span>
            </div>
          </div>

          <p className="text-base text-white/70">
            {currentStatus.message}
          </p>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Treino de Hoje */}
          <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
              Treino de Hoje
            </p>
            <div className="flex items-center gap-2 mb-3">
              {currentStatus.training.available ? (
                <CheckCircle size={24} className="text-green-400" />
              ) : (
                <XCircle size={24} style={{ color: tokens.textMuted }} />
              )}
              <span className={`text-2xl font-bold ${currentStatus.training.available ? 'text-green-400' : 'text-white/50'}`}>
                {currentStatus.training.available ? '✓' : '✗'} {currentStatus.training.text}
              </span>
            </div>
            <p className="text-sm" style={{ color: tokens.text }}>
              {currentStatus.training.description}
            </p>
          </div>

          {/* Última Validação */}
          <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
              Última Validação
            </p>
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-blue-400" />
              <span className="text-xl sm:text-2xl font-bold text-white">07/02/2026</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Clock size={16} />
              <span>às 08:30</span>
            </div>
          </div>
        </div>

        {/* Botão Check-in */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-8">
          {currentStatus.training.available ? (
            checkinDone ? (
              <button
                disabled
                className="w-full py-6 bg-green-600/20 border-2 border-green-600 rounded-2xl text-green-400 text-lg font-bold cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle size={24} />
                  <span>CHECK-IN JÁ REALIZADO HOJE</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleCheckin}
                disabled={isProcessing}
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl text-white text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>REGISTRANDO CHECK-IN...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare size={24} />
                      <span>FAZER CHECK-IN DE HOJE</span>
                    </>
                  )}
                </div>
              </button>
            )
          ) : (
            <>
              <button
                disabled
                className="w-full py-6 bg-dark-elevated/50 border-2 border-dark-surface rounded-2xl text-white/50 text-lg font-bold cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  <XCircle size={24} />
                  <span>CHECK-IN INDISPONÍVEL</span>
                </div>
              </button>
              
              <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl">
                <p className="text-sm text-blue-300 text-center">
                  ℹ️ Acesso temporariamente indisponível. Procure a recepção para regularizar sua situação.
                </p>
              </div>
            </>
          )}

          {checkinDone && (
            <div className="mt-6 p-4 bg-green-600/10 border border-green-600/30 rounded-xl animate-fade-in">
              <p className="text-center text-green-300 font-medium mb-2">
                ✓ Check-in realizado com sucesso!
              </p>
              <p className="text-center text-sm text-white/60">
                Registrado em 08/02/2026 às 09:15 • Bom treino!
              </p>
            </div>
          )}
        </div>

        {/* Botão Meu QR Code */}
        {currentStatus.training.available && (
          <button
            onClick={() => setShowQR(true)}
            className="w-full py-5 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/30 hover:bg-blue-600/10 rounded-2xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-center gap-3">
              <QrCode size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-white font-bold text-lg">Meu QR Code</span>
            </div>
            <p className="text-white/40 text-sm mt-1">Apresente na recepção para check-in rápido</p>
          </button>
        )}

        {/* QR Code Fullscreen Modal */}
        {showQR && typeof window !== 'undefined' && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-[#0d0d1a] flex items-center justify-center animate-fade-in"
            onClick={(e: { target: EventTarget; currentTarget: EventTarget }) => { if (e.target === e.currentTarget) setShowQR(false); }}
          >
            <QRGenerator
              alunoId="mock-user-id"
              nome="Usuário Mock"
              avatar="🥋"
              graduacao="Nível Básico"
              unidadeId="unit_01"
              size={240}
              fullscreen
              onClose={() => setShowQR(false)}
            />
          </div>,
          document.body
        )}

        {/* Grade de Horários de Treino */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Horários de Treino</h2>
            <p className="text-sm text-white/60">Grade semanal de sessões disponíveis</p>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-3 text-white/60 font-medium text-xs uppercase tracking-wider">Horário</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Seg</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Ter</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Qua</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Qui</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Sex</th>
                  <th className="text-center py-3 px-2 text-white/60 font-medium text-xs uppercase tracking-wider">Sáb</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {[
                  { time: '06:30', slots: ['Fundamentos', 'Fundamentos', 'Fundamentos', 'Fundamentos', 'Fundamentos', null] },
                  { time: '08:00', slots: [null, null, null, null, null, 'Open Mat'] },
                  { time: '10:00', slots: [null, null, null, null, null, 'Kids'] },
                  { time: '12:00', slots: ['All Levels', null, 'All Levels', null, 'All Levels', null] },
                  { time: '18:00', slots: ['Iniciante', 'Avançado', 'Iniciante', 'Avançado', 'Iniciante', null] },
                  { time: '19:30', slots: ['Avançado', 'Competição', 'Avançado', 'Competição', 'Open Mat', null] },
                  { time: '20:30', slots: ['No-Gi', null, 'No-Gi', null, null, null] },
                ].map((row) => (
                  <tr key={row.time}>
                    <td className="py-3 px-3 font-semibold text-white/70 whitespace-nowrap">{row.time}</td>
                    {row.slots.map((slot, i) => (
                      <td key={i} className="py-2 px-1.5 text-center">
                        {slot ? (
                          <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold leading-tight ${
                            slot === 'Fundamentos' ? 'bg-blue-500/15 text-blue-400' :
                            slot === 'Iniciante' ? 'bg-emerald-500/15 text-emerald-400' :
                            slot === 'Avançado' ? 'bg-amber-500/15 text-amber-400' :
                            slot === 'Competição' ? 'bg-red-500/15 text-red-400' :
                            slot === 'No-Gi' ? 'bg-purple-500/15 text-purple-400' :
                            slot === 'Kids' ? 'bg-pink-500/15 text-pink-400' :
                            slot === 'Open Mat' ? 'bg-cyan-500/15 text-cyan-400' :
                            'bg-white/5 text-white/50'
                          }`}>
                            {slot}
                          </span>
                        ) : (
                          <span className="text-white/10">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Histórico de Status</h2>
            <p className="text-sm text-white/60">Últimos 6 meses</p>
          </div>

          <div className="space-y-4">
            {historico.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-4 border-b border-dark-elevated last:border-0"
              >
                <div 
                  className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    item.color === 'green' ? 'bg-green-500' : 
                    item.color === 'yellow' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{
                    boxShadow: `0 0 8px ${
                      item.color === 'green' ? 'rgba(34, 197, 94, 0.5)' :
                      item.color === 'yellow' ? 'rgba(234, 179, 8, 0.5)' :
                      'rgba(239, 68, 68, 0.5)'
                    }`
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{item.month}</span>
                    <span className={`text-sm font-bold ${
                      item.color === 'green' ? 'text-green-400' :
                      item.color === 'yellow' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {item.status === 'ativo' ? 'ATIVO' : item.status === 'atraso' ? 'EM ATRASO' : 'BLOQUEADO'}
                    </span>
                  </div>
                  <span className="text-sm text-white/60">
                    {item.status === 'ativo' ? 'Validado em' : 'Regularizado em'} {item.date}
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
