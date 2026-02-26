'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileDropdownPortalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  children: ReactNode;
}

/**
 * ProfileDropdownPortal - Componente que renderiza dropdown usando React Portal
 * 
 * Resolve problemas de stacking context causados por:
 * - backdrop-blur
 * - overflow-hidden
 * - transform
 * - z-index battles
 * 
 * Renderiza diretamente no body usando createPortal
 */
export function ProfileDropdownPortal({
  isOpen,
  onClose,
  triggerRef,
  children,
}: ProfileDropdownPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { isDark } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // SSR-safe: só renderiza após montar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcular posição do dropdown baseado no botão trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current?.getBoundingClientRect();
        if (triggerRect) {
          const dropdownWidth = 256; // w-64 = 16rem = 256px
          const spacing = 8; // mt-2 = 0.5rem = 8px

          // Posição padrão: abaixo do botão, alinhado à direita
          let top = triggerRect.bottom + spacing;
          let left = triggerRect.right - dropdownWidth;

          // Ajustar se sair da tela pela direita
          if (left < 8) {
            left = 8;
          }

          // Ajustar se sair da tela pela esquerda
          const rightEdge = left + dropdownWidth;
          if (rightEdge > window.innerWidth - 8) {
            left = window.innerWidth - dropdownWidth - 8;
          }

          // Ajustar se sair da tela por baixo
          const dropdownHeight = 280; // altura aproximada
          if (top + dropdownHeight > window.innerHeight - 8) {
            // Renderizar acima do botão
            top = triggerRect.top - dropdownHeight - spacing;
          }

          setPosition({ top, left });
        }
      };

      updatePosition();

      // Atualizar posição em scroll e resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, triggerRef]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Não fechar se clicar no trigger ou no dropdown
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    // Pequeno delay para evitar fechar imediatamente ao abrir
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Não renderizar no servidor ou se não estiver aberto
  if (!mounted || !isOpen) {
    return null;
  }

  // Renderizar via Portal diretamente no body
  return createPortal(
    <div
      ref={dropdownRef}
      role="menu"
      aria-orientation="vertical"
      className="fixed z-[9999] w-64 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.97)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(107,68,35,0.12)'}`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
