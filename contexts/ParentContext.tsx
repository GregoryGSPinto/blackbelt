'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { 
  PARENT_PROFILES, 
  KIDS_PROFILES, 
  TEEN_PROFILES, 
  getKidsByParent, 
  getTeensByParent,
} from '@/lib/api/kids.service';
import type { KidProfile, TeenProfile, ParentProfile } from '@/lib/api/kids.service';
import { useAuth } from '@/contexts/AuthContext';

/** Tipo unificado para filhos (kid ou teen) — usado no dropdown de seleção */
export interface FilhoUnificado {
  id: string;
  nome: string;
  idade: number;
  nivel: string;
  turma: string;
  instrutor: string;
  status: string;
  avatar: string;
  progresso: {
    presenca30dias: number;
    sessõesAssistidas: number;
    desafiosConcluidos: number;
    conquistasConquistadas: number;
  };
  categoria: 'kids' | 'teen';
}

interface ParentContextType {
  selectedKidId: string | null;
  setSelectedKidId: (id: string) => void;
  selectedKid: FilhoUnificado | undefined;
  filhos: FilhoUnificado[];
  parentProfile: ParentProfile | undefined;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export function ParentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Encontrar o perfil de responsável correspondente ao user logado
  const parentProfile = useMemo(() => {
    if (!user) return PARENT_PROFILES[0]; // fallback
    return PARENT_PROFILES.find(p => p.email === user.email) || PARENT_PROFILES[0];
  }, [user]);

  // Buscar filhos KIDS e TEENS do responsável
  const filhos = useMemo<FilhoUnificado[]>(() => {
    if (!parentProfile) return [];

    const kids: FilhoUnificado[] = getKidsByParent(parentProfile.id).map(k => ({
      ...k,
      categoria: 'kids' as const,
    }));

    const teens: FilhoUnificado[] = getTeensByParent(parentProfile.id).map(t => ({
      ...t,
      categoria: 'teen' as const,
    }));

    return [...kids, ...teens];
  }, [parentProfile]);

  const [selectedKidId, setSelectedKidId] = useState<string | null>(
    filhos.length > 0 ? filhos[0].id : null
  );

  const selectedKid = filhos.find(k => k.id === selectedKidId);

  return (
    <ParentContext.Provider value={{ selectedKidId, setSelectedKidId, selectedKid, filhos, parentProfile }}>
      {children}
    </ParentContext.Provider>
  );
}

export function useParent() {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
}
