import { TestimonialDTO, CreateTestimonialDTO } from '@/lib/api/testimonials.service';

const MOCK_TESTIMONIALS: TestimonialDTO[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    comentario: 'A BlackBelt transformou completamente a gestão da minha academia. Consegui aumentar em 40% a retenção de alunos!',
    nota: 5,
    data: '2026-03-01',
    perfil: 'admin',
    status: 'aprovado'
  },
  {
    id: '2',
    nome: 'Prof. Ana Martinez',
    comentario: 'Como professora, consigo acompanhar o progresso de cada aluno de forma individualizada. Ferramentas incríveis!',
    nota: 5,
    data: '2026-02-28',
    perfil: 'professor',
    status: 'aprovado'
  },
  {
    id: '3',
    nome: 'João Pedro',
    comentario: 'Vejo meu filho mais motivado que nunca! O sistema de conquistas funciona muito bem para crianças.',
    nota: 5,
    data: '2026-02-25',
    perfil: 'responsavel',
    status: 'aprovado'
  },
  {
    id: '4',
    nome: 'Rafaela Costa',
    comentario: 'O app é intuitivo e moderno. Consigo marcar presença e acompanhar minha evolução no Jiu-Jitsu.',
    nota: 5,
    data: '2026-02-20',
    perfil: 'aluno',
    status: 'aprovado'
  },
  {
    id: '5',
    nome: 'Sensei Tanaka',
    comentario: 'Finalmente uma plataforma que entende as necessidades específicas das artes marciais.',
    nota: 5,
    data: '2026-02-15',
    perfil: 'professor',
    status: 'aprovado'
  }
];

export const mockGetTestimonials = async (limit: number, offset: number): Promise<TestimonialDTO[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_TESTIMONIALS.filter(t => t.status === 'aprovado').slice(offset, offset + limit);
};

export const mockCreateTestimonial = async (data: CreateTestimonialDTO): Promise<TestimonialDTO> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const novoDepoimento: TestimonialDTO = {
    id: Date.now().toString(),
    nome: data.nome,
    comentario: data.comentario,
    nota: data.nota,
    data: new Date().toISOString().split('T')[0],
    perfil: 'aluno',
    status: 'pendente'
  };
  
  MOCK_TESTIMONIALS.unshift(novoDepoimento);
  return novoDepoimento;
};
