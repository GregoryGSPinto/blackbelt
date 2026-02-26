'use client';

import { X } from 'lucide-react';
import { useLegalModal } from './useLegalModal';
import { getLegalContent } from './legal-contents';
import { LegalContentRenderer } from './LegalContentRenderer';
import type { LegalModalProps } from './types';

export function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  useLegalModal(isOpen, onClose);

  if (!isOpen) return null;

  const displayContent = getLegalContent(title, content);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay escuro institucional */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Card central premium */}
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all duration-200 hover:scale-110"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Conteúdo com scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] legal-content">
          <LegalContentRenderer content={displayContent} />
        </div>
        
        {/* Footer com botão fechar */}
        <div className="sticky bottom-0 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Animações CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Estilo de scroll customizado */
        .legal-content::-webkit-scrollbar {
          width: 8px;
        }

        .legal-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }

        .legal-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .legal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
