'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Mail, Play } from 'lucide-react';
import dynamic from 'next/dynamic';
import CinematicBackground from '@/components/ui/CinematicBackground';

/**
 * Lazy loading do LegalModal
 * Modal pesado (1000+ linhas) carregado apenas quando necessário
 */
const LegalModal = dynamic(
  () => import('@/components/modals/LegalModal').then(mod => ({ default: mod.LegalModal })),
  {
    loading: () => null, // Não mostrar loading - modal aparece instantaneamente
    ssr: false // Modal não precisa de SSR
  }
);

export default function PremiumLandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  
  // Estados para modais legais
  const [legalModal, setLegalModal] = useState<{isOpen: boolean; title: string}>({
    isOpen: false,
    title: ''
  });

  const openLegalModal = (title: string) => {
    setLegalModal({ isOpen: true, title });
  };

  const closeLegalModal = () => {
    setLegalModal({ isOpen: false, title: '' });
  };

  // Top 10 com vídeos reais do YouTube
  const top10Videos = [
    {
      rank: 1,
      youtubeId: '3sv8YS6V1n4',
      title: 'Fundamentos de Guarda Fechada',
      category: 'Técnicas Essenciais'
    },
    {
      rank: 2,
      youtubeId: '0QDgz6cD4LQ',
      title: 'Passagem de Guarda Avançada',
      category: 'Nível Intermediário'
    },
    {
      rank: 3,
      youtubeId: '9VhHuMtdV38',
      title: 'Defesa e Contra-Ataque',
      category: 'Defesa'
    },
    {
      rank: 4,
      youtubeId: 'NJV0HIN5GWI',
      title: 'Finalizações de Guarda',
      category: 'Ataque'
    },
    {
      rank: 5,
      youtubeId: 'JsTcW7p2nn8',
      title: 'Raspagens Avançadas',
      category: 'Técnicas Intermediárias'
    },
    {
      rank: 6,
      youtubeId: '0vLDElI_Mz8',
      title: 'Passagem X Guard',
      category: 'Avançado'
    },
    {
      rank: 7,
      youtubeId: '3sv8YS6V1n4',
      title: 'Técnicas de Takedown',
      category: 'Quedas'
    },
    {
      rank: 8,
      youtubeId: '0QDgz6cD4LQ',
      title: 'Defesa de Costas',
      category: 'Defesa Essencial'
    },
    {
      rank: 9,
      youtubeId: '9VhHuMtdV38',
      title: 'Berimbolo Detalhado',
      category: 'Nível Máximo'
    },
    {
      rank: 10,
      youtubeId: 'NJV0HIN5GWI',
      title: 'Leg Locks Fundamentais',
      category: 'Finalização'
    }
  ];

  const faqs = [
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim. Sem taxas de cancelamento ou multas.'
    },
    {
      question: 'Funciona em todos os dispositivos?',
      answer: 'Sim. Mobile, tablet, desktop e smart TV.'
    },
    {
      question: 'É adequado para iniciantes?',
      answer: 'Sim. Conteúdo organizado por nível de experiência.'
    },
    {
      question: 'Tem conteúdo infantil?',
      answer: 'Sim. Modo Kids com controle parental completo.'
    }
  ];

  // Autoplay no hover
  useEffect(() => {
    if (hoveredVideo !== null) {
      const iframe = videoRefs.current[hoveredVideo];
      if (iframe) {
        // Play depois de 500ms
        const playTimer = setTimeout(() => {
          iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }, 500);

        // Pause depois de 15s
        const pauseTimer = setTimeout(() => {
          iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          setHoveredVideo(null);
        }, 15500);

        return () => {
          clearTimeout(playTimer);
          clearTimeout(pauseTimer);
        };
      }
    }
  }, [hoveredVideo]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header Fixo — Desktop matches adult header, Mobile matches mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        {/* Mobile: 72px, bg-black/60 */}
        <div className="md:hidden flex items-center justify-between px-6 h-[72px] bg-black/60 backdrop-blur-md border-b border-white/5">
          <Link href="/landing" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/blackbelt-logo-circle.jpg" alt="BlackBelt" width={48} height={48} className="rounded-full" />
            <span className="text-xl font-bold tracking-tight">BLACKBELT</span>
          </Link>
          <Link href="/login"
            className="px-5 py-2 bg-white/10 backdrop-blur-sm border border-white/20 font-semibold rounded hover:bg-white/20 transition-colors text-sm">
            ENTRAR
          </Link>
        </div>
        {/* Desktop: 96px, same gradient/blur as adult header */}
        <div className="hidden md:flex items-center justify-between px-8 lg:px-14"
          style={{
            height: 96,
            background: 'linear-gradient(180deg, rgba(8,7,6,0.85) 0%, rgba(8,7,6,0.5) 100%)',
            backdropFilter: 'blur(24px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
          <Link href="/landing" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <Image src="/blackbelt-logo-circle.jpg" alt="BlackBelt" width={54} height={54}
              className="rounded-full shadow-lg" style={{ boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08)' }} />
            <span className="text-[20px] font-bold tracking-wide">BLACKBELT</span>
          </Link>
          <Link href="/login"
            className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 font-semibold rounded hover:bg-white/20 transition-colors">
            ENTRAR
          </Link>
        </div>
      </header>

      {/* Background Cinematográfico */}
      <CinematicBackground />

      {/* Content que rola */}
      <main className="relative z-10">
        {/* Spacer para header + safe-area */}
        <div className="h-24 md:h-[96px]" />

        {/* Hero Section - PREMIUM CINEMATOGRÁFICO */}
        <section className="min-h-screen flex items-end justify-center pb-24 md:pb-32 animate-fade-in">
          <div className="text-center max-w-3xl px-6">
            <p className="text-xl md:text-2xl lg:text-3xl font-light mb-4 leading-relaxed text-white/70 italic animate-slide-up">
              &ldquo;O treinamento especializado que criei foi para dar chance aos mais fracos&rdquo;
            </p>
            <p className="text-sm md:text-base text-white/40 font-light tracking-[0.4em] uppercase animate-slide-up animation-delay-200">
              Hélio Gracie
            </p>
          </div>
        </section>

        {/* Top 10 da Semana - MANTIDO INTACTO */}
        <section id="top10" className="container mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-5xl font-black mb-12 animate-fade-in">
            Top 10 da Semana
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {top10Videos.map((video, index) => (
              <div
                key={video.rank}
                className="group relative cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredVideo(index)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 -left-3 z-20 w-14 h-14 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-black text-xl shadow-2xl border-4 border-black">
                  {video.rank}
                </div>

                {/* Video Container */}
                <div className="relative aspect-video bg-dark-card rounded-xl overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:z-10">
                  {hoveredVideo === index ? (
                    // Autoplay iframe
                    <iframe
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&enablejsapi=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    // Thumbnail
                    <>
                      <Image
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-8 h-8 text-white drop-shadow-2xl" fill="white" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="mt-4">
                  <h3 className="font-bold text-base line-clamp-2 group-hover:text-white/90 transition-colors leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-sm text-white/40 mt-1.5">{video.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Adicionados Recentemente - NOVO */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-5xl font-black mb-12 animate-fade-in">
            Adicionados Recentemente
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {top10Videos.slice(0, 5).map((video, index) => (
              <div
                key={`recent-${index}`}
                className="group relative cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-dark-card rounded-xl overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:z-10">
                  <Image
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-300" />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded shadow-lg">
                    NOVO
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white drop-shadow-2xl" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4">
                  <h3 className="font-bold text-base line-clamp-2 group-hover:text-white/90 transition-colors leading-tight">
                    {video.title}
                  </h3>
                  <p className="text-sm text-white/40 mt-1.5">{video.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid - Minimalista */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { emoji: '📱', title: 'Qualquer dispositivo', desc: 'Mobile, tablet ou desktop' },
              { emoji: '🥋', title: 'Todos os níveis', desc: 'Do iniciante ao nível máximo' },
              { emoji: '👨‍👩‍👧', title: 'Modo família', desc: 'Perfis Kids, Teen e Adulto' },
              { emoji: '🏆', title: 'Campeões', desc: 'Conteúdo validado' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Perguntas Frequentes
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-5 text-white/55">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Email Capture */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para evoluir?
            </h2>
            <p className="text-white/55 mb-8">
              Cadastre seu email para receber novidades
            </p>
            
            <div className="flex gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (email) {
                    // TODO(FE-021): Integrar POST /newsletter/subscribe
                    setEmailSent(true);
                    setEmail('');
                    setTimeout(() => setEmailSent(false), 4000);
                  }
                }}
                className="px-6 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                {emailSent ? '✓ Enviado!' : 'Enviar'}
              </button>
            </div>
            
            <p className="text-sm text-white/35 mt-4">
              Respeitamos sua privacidade. Sem spam.
            </p>
          </div>
        </section>

        {/* Footer Institucional */}
        <footer className="container mx-auto px-6 py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            {/* Links Legais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div>
                <h3 className="font-bold mb-4 text-white/55">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button 
                      onClick={() => openLegalModal('Política de Privacidade')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Política de Privacidade
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openLegalModal('Termos de Uso')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Termos de Uso
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openLegalModal('Política de Cookies')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Política de Cookies
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openLegalModal('Contrato de Assinatura')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Contrato de Assinatura
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white/55">Privacidade</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button 
                      onClick={() => openLegalModal('Aviso de Direitos de Privacidade do Brasil')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Aviso de Direitos de Privacidade do Brasil
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openLegalModal('Proteção de Dados no Brasil')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Proteção de Dados no Brasil
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white/55">Suporte</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button 
                      onClick={() => openLegalModal('Ajuda')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Ajuda
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => openLegalModal('Dispositivos compatíveis')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Dispositivos compatíveis
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white/55">Empresa</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button 
                      onClick={() => openLegalModal('Sobre BlackBelt+')}
                      className="text-white/40 hover:text-white transition-colors text-left"
                    >
                      Sobre BlackBelt+
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="mb-12">
              <h3 className="font-bold mb-6 text-white/55 text-center">Siga-nos</h3>
              <div className="flex justify-center gap-4">
                {/* Instagram */}
                <a
                  href="https://instagram.com/blackbelt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@blackbelt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-white/5 text-center">
              <p className="text-white/35 text-sm">
                &copy; 2026 BlackBelt. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal Legal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegalModal}
        title={legalModal.title}
      />

      {/* Animações CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
