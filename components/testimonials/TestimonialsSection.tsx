"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ChevronDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createTestimonial } from '@/lib/api/testimonials.service';
import type { TestimonialDTO } from '@/lib/api/testimonials.service';

interface TestimonialsSectionProps {
  testimonials: TestimonialDTO[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [mounted, setMounted] = useState(false);
  const tActions = useTranslations('common.actions');
  const { user } = useAuth();
  const [visibleCount, setVisibleCount] = useState(3);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    comentario: '',
    nota: 5
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full py-16 text-center text-slate-400">{tActions('loading')}</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTestimonial({
        nome: formData.nome,
        comentario: formData.comentario,
        nota: formData.nota
      });
      
      setFormData({ nome: '', comentario: '', nota: 5 });
      setIsFormOpen(false);
      setShowThanks(true);
      setTimeout(() => setShowThanks(false), 3000);
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPerfilLabel = (perfil: string) => {
    const labels: Record<string, string> = {
      'aluno': 'Aluno',
      'professor': 'Professor',
      'responsavel': 'Responsável',
      'admin': 'Administrador'
    };
    return labels[perfil] || 'Usuário';
  };

  const visibleTestimonials = testimonials.slice(0, visibleCount);
  const hasMore = visibleCount < testimonials.length;

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            O que dizem nossos clientes
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <MessageSquare className="w-5 h-5" />
            {isFormOpen ? 'Cancelar' : 'Deixar meu depoimento'}
          </button>
        </motion.div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  Compartilhe sua experiência
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seu nome
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                      placeholder="Como quer ser chamado?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Avaliação
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({...formData, nota: star})}
                          className="transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= formData.nota ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Seu depoimento
                    </label>
                    <textarea
                      value={formData.comentario}
                      onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none resize-none"
                      placeholder="Conte como a BlackBelt ajudou você..."
                      required
                      maxLength={500}
                    />
                    <span className="text-xs text-slate-400 mt-1 block">
                      {formData.comentario.length}/500 caracteres
                    </span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? tActions('sending') : tActions('submit')}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showThanks && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowThanks(false)} />
              <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 text-center shadow-2xl">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600 fill-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Obrigado!</h3>
                <p className="text-slate-600">
                  Seu depoimento foi enviado com sucesso e será publicado após moderação.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
              <div className="bg-white rounded-2xl p-8 max-w-md w-full relative z-10 shadow-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Faça login para continuar</h3>
                <p className="text-slate-600 mb-6">
                  Para enviar um depoimento, você precisa estar logado na plataforma.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <a
                    href="/login"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-center"
                  >
                    Fazer login
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {visibleTestimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                layout
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.nome}</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {getPerfilLabel(testimonial.perfil)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.nota)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <p className="text-slate-700 leading-relaxed mb-4">
                  "{testimonial.comentario}"
                </p>
                
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatarData(testimonial.data)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={() => setVisibleCount(prev => prev + 3)}
              className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors px-6 py-3 rounded-full hover:bg-red-50"
            >
              <ChevronDown className="w-5 h-5" />
              Ver mais depoimentos
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
