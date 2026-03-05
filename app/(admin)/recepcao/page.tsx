'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Check, X, AlertCircle, ArrowLeft, QrCode, Keyboard } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario } from '@/lib/api/admin.service';
import * as checkinService from '@/lib/api/checkin.service';
import type { CheckInQR, CheckInResult } from '@/lib/api/contracts';
import { QRScanner } from '@/components/checkin/QRScanner';
import Link from 'next/link';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

type CheckinMode = 'manual' | 'qr';

export default function RecepcaoPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [mode, setMode] = useState<CheckinMode>('manual');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Usuario | null>(null);
  const [qrResult, setQrResult] = useState<CheckInResult | null>(null);
  const [alunos, setAlunos] = useState<Usuario[]>([]);
  const [checkInsHoje, setCheckInsHoje] = useState<{ alunoId: string }[]>([]);
  const [turmasMap, setTurmasMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [usuariosData, checkInsData, turmasData] = await Promise.all([
          adminService.getUsuarios(),
          adminService.getCheckIns(),
          adminService.getTurmas(),
        ]);
        setAlunos(usuariosData.filter(u => u.tipo === 'ALUNO'));
        setCheckInsHoje(checkInsData.filter(c => c.data === '2026-02-02'));
        const map: Record<string, string> = {};
        turmasData.forEach(t => { map[t.id] = t.nome; });
        setTurmasMap(map);
      } catch (err) {
        setError(handleServiceError(err, 'Recepcao'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  const filteredAlunos = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = (aluno: Usuario) => {
    setSelectedAluno(aluno);
    
    if (aluno.status === 'BLOQUEADO') {
      setShowBlocked(true);
      setTimeout(() => setShowBlocked(false), 3000);
      return;
    }

    // Verificar se já fez check-in hoje
    const jaFezCheckIn = checkInsHoje.some(c => c.alunoId === aluno.id);
    if (jaFezCheckIn) {
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSearchTerm('');
    }, 2000);
  };

  const getAlunoCheckInStatus = (alunoId: string) => {
    return checkInsHoje.some(c => c.alunoId === alunoId);
  };

  // ── QR Scan handler ──
  const handleQRScan = useCallback(async (qrData: CheckInQR) => {
    setQrResult(null);
    try {
      const result = await checkinService.validateAndCheckin(qrData);
      setQrResult(result);

      if (result.success && result.aluno) {
        // Match aluno for the success alert
        const matched = alunos.find(a => a.id === result.aluno!.id);
        if (matched) {
          setSelectedAluno(matched);
          setShowSuccess(true);
          setTimeout(() => { setShowSuccess(false); setQrResult(null); }, 3000);
        }
      } else if (result.aluno?.status === 'BLOQUEADO') {
        const matched = alunos.find(a => a.id === result.aluno!.id);
        if (matched) {
          setSelectedAluno(matched);
          setShowBlocked(true);
          setTimeout(() => { setShowBlocked(false); setQrResult(null); }, 3000);
        }
      }
    } catch {
      setQrResult({ success: false, error: 'Erro ao processar QR Code.' });
    }
  }, [alunos]);

  if (loading) {
    return <PremiumLoader text="Carregando recepção..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <div>
                <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>MODO RECEPÇÃO</h1>
                <p className="text-white/50 text-lg">Check-in Rápido</p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Painel</span>
          </Link>
        </div>

        {/* Success Alert */}
        {showSuccess && selectedAluno && (
          <div className="bg-white/5 border border-white/15 rounded-2xl p-8 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 border border-white/10 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">BEM-VINDO(A)!</h3>
                <p className="text-2xl text-green-400">{selectedAluno.nome}</p>
                <p className="text-lg text-white/50 mt-1">
                  Check-in realizado às {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Blocked Alert */}
        {showBlocked && selectedAluno && (
          <div className="bg-black/40 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">ACESSO BLOQUEADO</h3>
                <p className="text-2xl text-red-400">{selectedAluno.nome}</p>
                <p className="text-lg text-white/50 mt-2">
                  {selectedAluno.observacoes || 'Por favor, dirija-se à recepção para regularizar sua situação.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-bold transition-all ${
              mode === 'manual'
                ? 'bg-white/10 border-2 border-white/20 text-white'
                : 'bg-white/5 border-2 border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            <Keyboard size={22} />
            Busca Manual
          </button>
          <button
            onClick={() => setMode('qr')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-bold transition-all ${
              mode === 'qr'
                ? 'bg-blue-600/20 border-2 border-blue-500/30 text-blue-400'
                : 'bg-white/5 border-2 border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            <QrCode size={22} />
            Scanner QR
          </button>
        </div>

        {/* ── QR Scanner Mode ── */}
        {mode === 'qr' && (
          <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white text-center mb-2">Scanner QR Code</h2>
              <p className="text-white/40 text-sm text-center mb-6">
                Aponte a câmera para o QR Code do aluno
              </p>

              <QRScanner
                onScan={handleQRScan}
                mockMode={true}
              />

              {/* QR Error result */}
              {qrResult && !qrResult.success && qrResult.error && !showBlocked && (
                <div className="mt-4 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-bold text-sm">Erro no check-in</p>
                      <p className="text-white/50 text-sm">{qrResult.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* QR Aluno info on success */}
              {qrResult?.success && qrResult.aluno && (
                <div className="mt-4 p-4 bg-green-600/10 border border-green-600/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                      <Check size={24} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-green-400 font-bold">{qrResult.aluno.nome}</p>
                      <p className="text-white/50 text-sm">{qrResult.aluno.graduacao} • Check-in registrado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Manual Mode: Search Area ── */}
        {mode === 'manual' && (
        <>
        {/* Search Area */}
        <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-8">
          <label className="block text-xl font-medium text-white/50 mb-4">
            Buscar Aluno
          </label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome ou ID do aluno..."
              className="w-full pl-20 pr-6 py-4 sm:py-6 bg-white/10 border-2 border-white/15 rounded-xl text-white text-2xl placeholder-white/30 focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && filteredAlunos.length > 0 && (
          <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl overflow-hidden">
            <div className="divide-y-2 divide-white/10">
              {filteredAlunos.slice(0, 5).map((aluno) => {
                const jaFezCheckIn = getAlunoCheckInStatus(aluno.id);
                const turmaNome = turmasMap[aluno.turmaId || ''] || 'Sem turma';

                return (
                  <div
                    key={aluno.id}
                    className={`p-6 hover:bg-white/5 transition-colors ${
                      aluno.status === 'BLOQUEADO' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-2xl">
                            {aluno.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl sm:text-2xl font-bold text-white">{aluno.nome}</h4>
                            {aluno.status === 'ATIVO' && (
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-green-400 font-medium">
                                Ativo
                              </span>
                            )}
                            {aluno.status === 'EM_ATRASO' && (
                              <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-600/30 rounded-full text-sm text-yellow-400 font-medium">
                                Em Atraso
                              </span>
                            )}
                            {aluno.status === 'BLOQUEADO' && (
                              <span className="px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full text-sm text-red-400 font-medium">
                                Bloqueado
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-lg text-white/50">
                            <span>{aluno.graduacao}</span>
                            <span>•</span>
                            <span>{turmaNome}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckIn(aluno)}
                        disabled={jaFezCheckIn || aluno.status === 'BLOQUEADO'}
                        className={`px-10 py-5 rounded-xl font-bold text-lg transition-all ${
                          jaFezCheckIn
                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                            : aluno.status === 'BLOQUEADO'
                            ? 'bg-black/30 border border-red-500/20 text-red-400 cursor-not-allowed'
                            : 'bg-white/10 border border-white/10 hover:bg-white/15 text-white hover:scale-105 shadow-lg shadow-white/5'
                        }`}
                      >
                        {jaFezCheckIn ? (
                          <span className="flex items-center gap-3">
                            <Check className="w-6 h-6" />
                            Já Fez Check-in
                          </span>
                        ) : aluno.status === 'BLOQUEADO' ? (
                          <span className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6" />
                            Bloqueado
                          </span>
                        ) : (
                          'VALIDAR CHECK-IN'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {searchTerm && filteredAlunos.length === 0 && (
          <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-12 text-center">
            <Search className="w-20 h-20 text-white/30 mx-auto mb-4" />
            <p className="text-2xl text-white/50">Nenhum aluno encontrado</p>
          </div>
        )}

        {/* Stats */}
        {!searchTerm && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-8">
              <p className="text-xl text-white/50 mb-2">Check-ins Hoje</p>
              <p className="text-6xl font-bold text-white/70">{checkInsHoje.length}</p>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-8">
              <p className="text-xl text-white/50 mb-2">Total de Alunos</p>
              <p className="text-6xl font-bold text-white">{alunos.length}</p>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
