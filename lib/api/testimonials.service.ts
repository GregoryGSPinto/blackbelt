import { isMock } from '@/lib/env';

export interface TestimonialDTO {
  id: string;
  nome: string;
  comentario: string;
  nota: number;
  data: string;
  perfil: 'aluno' | 'professor' | 'responsavel' | 'admin';
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

export interface CreateTestimonialDTO {
  nome: string;
  comentario: string;
  nota: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getTestimonials = async (limit: number = 10, offset: number = 0): Promise<TestimonialDTO[]> => {
  if (isMock()) {
    const { mockGetTestimonials } = await import('@/lib/__mocks__/testimonials.mock');
    return mockGetTestimonials(limit, offset);
  }
  
  const res = await fetch(`${API_URL}/testimonials?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error('Erro ao buscar depoimentos');
  return res.json();
};

export const createTestimonial = async (data: CreateTestimonialDTO): Promise<TestimonialDTO> => {
  if (isMock()) {
    const { mockCreateTestimonial } = await import('@/lib/__mocks__/testimonials.mock');
    return mockCreateTestimonial(data);
  }
  
  const res = await fetch(`${API_URL}/testimonials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Erro ao criar depoimento');
  }
  
  return res.json();
};
