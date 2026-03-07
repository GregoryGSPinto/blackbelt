'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronDown, Calendar } from 'lucide-react';

const MOCK_TESTIMONIALS = [
  { id: '1', nome: 'Carlos Silva', comentario: 'A BlackBelt transformou completamente a gestão da minha academia!', nota: 5, data: '2026-03-01', perfil: 'admin' },
  { id: '2', nome: 'Prof. Ana Martinez', comentario: 'Consigo acompanhar o progresso de cada aluno de forma individualizada.', nota: 5, data: '2026-02-28', perfil: 'professor' },
  { id: '3', nome: 'João Pedro', comentario: 'Meu filho está mais motivado que nunca com o sistema de conquistas!', nota: 5, data: '2026-02-25', perfil: 'responsavel' }
];

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [formData, setFormData] = useState({ nome: '', comentario: '', nota: 5 });
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando...</div>;

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setShowLoginModal(true); };

  const visibleTestimonials = MOCK_TESTIMONIALS.slice(0, visibleCount);
  const hasMore = visibleCount < MOCK_TESTIMONIALS.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">BlackBelt</h1>
          <p className="text-slate-600 text-center mb-6">Gestão inteligente para artes marciais</p>
          <form className="space-y-4">
            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 outline-none" />
            <input type="password" placeholder="Senha" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 outline-none" />
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold">Entrar</button>
          </form>
        </div>
      </div>

      <section className="w-full py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">O que dizem nossos clientes</h2>
          </div>

          <div className="flex justify-center mb-10">
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
              <MessageSquare className="w-5 h-5" />
              {isFormOpen ? 'Cancelar' : 'Deixar meu depoimento'}
            </button>
          </div>

          {isFormOpen && (
            <div className="mb-10 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                Compartilhe sua experiência
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Seu nome" className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none" required />
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setFormData({...formData, nota: star})}>
                      <Star className={`w-8 h-8 ${star <= formData.nota ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={formData.comentario} onChange={(e) => setFormData({...formData, comentario: e.target.value})} rows={4} placeholder="Seu depoimento..." className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none resize-none" maxLength={500} />
                <span className="text-xs text-slate-400">{formData.comentario.length}/500</span>
                <button type="submit" className="w-full bg-slate-900 text-white font-semibold py-3 rounded-lg">Enviar depoimento</button>
              </form>
            </div>
          )}

          {showLoginModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowLoginModal(false)} />
              <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 shadow-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Faça login para continuar</h3>
                <p className="text-slate-600 mb-6">Para enviar um depoimento, você precisa estar logado.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowLoginModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancelar</button>
                  <button onClick={() => setShowLoginModal(false)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">Fazer login</button>
                </div>
              </div>
            </div>
          )}

          {showThanks && (
            <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowThanks(false)} />
              <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 text-center shadow-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600 fill-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Obrigado!</h3>
                <p className="text-slate-600">Seu depoimento foi enviado com sucesso!</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {visibleTestimonials.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">{t.nome.charAt(0)}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.nome}</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{t.perfil}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">{[...Array(t.nota)].map((_,i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">"{t.comentario}"</p>
                <div className="flex items-center gap-2 text-slate-400 text-sm"><Calendar className="w-4 h-4" /><span>{formatarData(t.data)}</span></div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button onClick={() => setVisibleCount(prev => prev + 3)} className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium px-6 py-3 rounded-full hover:bg-red-50">
                <ChevronDown className="w-5 h-5" />Ver mais depoimentos
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
