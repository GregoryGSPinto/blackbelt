'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PERFIL_INFO, useAuth, getRedirectForProfile } from '@/contexts/AuthContext';
import type { User, TipoPerfil } from '@/contexts/AuthContext';
import { LogOut, Settings, Shield, Lock, Eye, EyeOff, X } from 'lucide-react';
import { KidsGatekeeper } from '@/components/shared/KidsGatekeeper';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Tela de seleção de perfil — Design premium estilo streaming.
 *
 * Funcionalidades:
 * - Lista perfis vinculados ao email autenticado
 * - Solicita senha ao trocar de perfil (segurança familiar)
 * - Gatekeeper quando saindo de perfil Kids → perfil adulto
 * - Animações suaves e design Netflix/Disney+
 * - Logout seguro
 */
export default function ProfileSelectionPage() {
  const router = useRouter();
  const { user, availableProfiles, setPerfil, logout, verifyPassword } = useAuth();
  const { isDark } = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showGatekeeper, setShowGatekeeper] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Focus no input quando modal abre
  useEffect(() => {
    if (showPasswordModal && passwordInputRef.current) {
      setTimeout(() => passwordInputRef.current?.focus(), 200);
    }
  }, [showPasswordModal]);

  // Se não autenticado, redirecionar
  if (!user) {
    if (typeof window !== 'undefined') router.replace('/landing');
    return null;
  }

  // Perfis para exibir
  const profiles = availableProfiles.length > 0 ? availableProfiles : [user];

  // Verificar se o perfil atual é Kids (requer gatekeeper para sair)
  const isCurrentlyKids = user.tipo === 'ALUNO_KIDS';

  // Perfis adultos (requerem gatekeeper se saindo de Kids)
  const adultTypes: TipoPerfil[] = ['ALUNO_ADULTO', 'RESPONSAVEL', 'INSTRUTOR', 'GESTOR', 'ADMINISTRADOR', 'SUPER_ADMIN'];

  const handleSelectProfile = (profile: User) => {
    // Se é o mesmo perfil, não fazer nada
    if (profile.id === user.id) return;

    // Se perfil atual é Kids e destino é adulto → gatekeeper primeiro
    if (isCurrentlyKids && adultTypes.includes(profile.tipo)) {
      setPendingProfile(profile);
      setShowGatekeeper(true);
      return;
    }

    // Solicitar senha para trocar de perfil
    setPendingProfile(profile);
    setPassword('');
    setPasswordError('');
    setShowPassword(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('Digite a senha');
      return;
    }

    setVerifying(true);
    setPasswordError('');

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setShowPasswordModal(false);
        setPassword('');
        if (pendingProfile) {
          activateProfile(pendingProfile);
        }
      } else {
        setPasswordError('Senha incorreta');
        setPassword('');
        passwordInputRef.current?.focus();
      }
    } catch {
      setPasswordError('Erro ao verificar senha');
    } finally {
      setVerifying(false);
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
    if (e.key === 'Escape') {
      setShowPasswordModal(false);
      setPendingProfile(null);
    }
  };

  const activateProfile = (profile: User) => {
    setSelectedId(profile.id);
    setIsTransitioning(true);

    setTimeout(() => {
      setPerfil(profile);
      router.push(getRedirectForProfile(profile.tipo));
    }, 800);
  };

  const handleGatekeeperSuccess = () => {
    setShowGatekeeper(false);
    if (pendingProfile) {
      // Após gatekeeper, ainda pedir senha
      setPassword('');
      setPasswordError('');
      setShowPassword(false);
      setShowPasswordModal(true);
    }
  };

  const handleLogout = () => {
    if (isCurrentlyKids) {
      setPendingProfile(null);
      setShowGatekeeper(true);
      return;
    }
    logout();
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ color: isDark ? '#FFFFFF' : '#15120C' }}>
      {/* Background provided by global ThemedBackground in root layout */}

      {/* Content */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image
            src="/blackbelt-logo-circle.jpg"
            alt="BlackBelt"
            width={64}
            height={64}
            className="rounded-full mx-auto mb-4 shadow-2xl ring-2 ring-white/20"
          />
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight">Quem está treinando?</h1>
          <p className="text-white/40 mt-2 text-sm">{user.email}</p>
        </div>

        {/* Profile Cards */}
        <div className={`grid gap-6 mb-10 ${
          profiles.length <= 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-lg' :
          profiles.length <= 4 ? 'grid-cols-2 md:grid-cols-4 max-w-3xl' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-5xl'
        }`}>
          {profiles.map((profile, index) => {
            const info = PERFIL_INFO[profile.tipo];
            const isSelected = selectedId === profile.id;
            const isCurrentProfile = user.id === profile.id;

            return (
              <button
                key={profile.id}
                onClick={() => handleSelectProfile(profile)}
                disabled={isTransitioning}
                className={`group flex flex-col items-center transition-all duration-500 ${
                  isTransitioning && !isSelected ? 'opacity-30 scale-90' : ''
                } ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Avatar */}
                <div className={`relative w-20 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-24 md:h-28 lg:h-32 rounded-2xl mb-3 flex items-center justify-center text-5xl transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'ring-4 ring-white shadow-2xl shadow-white/20'
                    : isCurrentProfile
                      ? 'ring-2 ring-white/40'
                      : 'ring-2 ring-white/10 group-hover:ring-white/30'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.cor} opacity-90`} />
                  <span className="relative z-10 text-5xl">
                    {profile.avatar || info.icone}
                  </span>

                  {/* Current indicator */}
                  {isCurrentProfile && !isSelected && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}

                  {/* Lock icon — outros perfis */}
                  {!isCurrentProfile && !isSelected && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock size={10} className="text-white" />
                    </div>
                  )}

                  {/* Kids shield */}
                  {profile.tipo === 'ALUNO_KIDS' && (
                    <div className="absolute top-1 left-1 w-6 h-6 bg-amber-500/90 rounded-lg flex items-center justify-center">
                      <Shield size={12} className="text-white" />
                    </div>
                  )}

                  {/* Transition overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center animate-pulse">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className={`font-semibold text-sm transition-all ${
                  isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  {profile.nome?.split(' ')[0]}
                </p>

                {/* Profile type badge */}
                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full transition-all ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60'
                }`}>
                  {info.label}
                </span>

                {/* Graduation */}
                {profile.graduacao && (
                  <span className="text-xs text-white/30 mt-1">{profile.graduacao}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            <span>Sair</span>
          </button>

          <div className="w-px h-4 bg-white/10" />

          <button
            onClick={() => router.push('/configuracoes')}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-all duration-300 group"
          >
            <Settings size={16} className="group-hover:rotate-45 transition-transform" />
            <span>Gerenciar Perfis</span>
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL DE SENHA — Premium glassmorphism      */}
      {/* ============================================ */}
      {showPasswordModal && pendingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(107,68,35,0.25)' }}
            onClick={() => {
              setShowPasswordModal(false);
              setPendingProfile(null);
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-modal-in"
            style={{
              background: isDark ? 'rgba(var(--color-card) / 0.95)' : 'rgba(255,255,255,0.97)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(107,68,35,0.12)'}`,
            }}>
            {/* Close button */}
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPendingProfile(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Header com avatar do perfil destino */}
            <div className="pt-8 pb-4 px-6 text-center">
              <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4 bg-gradient-to-br ${PERFIL_INFO[pendingProfile.tipo].cor} ring-2 ring-white/20`}>
                {pendingProfile.avatar || PERFIL_INFO[pendingProfile.tipo].icone}
              </div>
              <h3 className="text-lg font-bold text-white">
                Trocar para {pendingProfile.nome?.split(' ')[0]}
              </h3>
              <p className="text-sm text-white/50 mt-1">
                Digite a senha da conta para continuar
              </p>
            </div>

            {/* Input de senha */}
            <div className="px-6 pb-6">
              <div className="relative mb-4">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Senha"
                  aria-label="Senha do perfil"
                  className={`w-full pl-11 pr-12 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-all ${
                    passwordError 
                      ? 'border-red-500/50 focus:ring-red-500/30' 
                      : 'border-white/10 focus:ring-white/20 focus:border-white/20'
                  }`}
                  disabled={verifying}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Erro */}
              {passwordError && (
                <p className="text-red-400 text-sm mb-4 text-center animate-shake">
                  {passwordError}
                </p>
              )}

              {/* Botão confirmar */}
              <button
                onClick={handlePasswordSubmit}
                disabled={verifying || !password.trim()}
                className={`w-full py-3.5 font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-[#3D2E1F] text-white hover:bg-[#2A2016]'
                }`}
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>

              {/* Link esqueceu senha */}
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPendingProfile(null);
                  router.push('/esqueci-senha');
                }}
                className="w-full mt-3 text-sm text-white/30 hover:text-white/60 transition-colors text-center"
              >
                Esqueceu a senha?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gatekeeper */}
      <KidsGatekeeper
        isOpen={showGatekeeper}
        onSuccess={() => {
          if (pendingProfile) {
            handleGatekeeperSuccess();
          } else {
            setShowGatekeeper(false);
            logout();
          }
        }}
        onCancel={() => {
          setShowGatekeeper(false);
          setPendingProfile(null);
        }}
      />

      {/* CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
