/**
 * academyConfig — Configuração das áreas de conhecimento
 * TODO(FE-030): Substituir por GET /academy/areas (gerenciado pelo instrutor)
 */

import {
  GraduationCap, Brain, Users, BookOpen, Heart, Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AcademyArea {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  accentDark: string;
  content: {
    intro: string;
    paragraphs: string[];
    keyPoints: string[];
  };
}

export const ACADEMY_AREAS: AcademyArea[] = [
  {
    id: 'fundamentos',
    icon: GraduationCap,
    title: 'Fundamentos do treinamento especializado',
    description: 'Base, postura, controle e equilíbrio. A técnica antes da força.',
    accent: '#B89A6A',
    accentDark: '#8C6239',
    content: {
      intro: 'O treinamento especializado não começa na finalização, começa no controle do próprio corpo.',
      paragraphs: [
        'Uma boa base impede quedas, melhora a pressão e economiza energia. Sem base sólida, mesmo técnicas avançadas perdem eficácia. O praticante que domina sua base controla o ritmo da luta.',
        'A postura protege contra ataques e permite atacar com segurança. Manter a coluna alinhada e os braços na posição correta é a primeira linha de defesa no ambiente.',
        'Controle significa dominar espaço e tempo do adversário. Não é apenas segurar — é impor sua vontade através de posicionamento inteligente e pressão calculada.',
        'O equilíbrio é o fundamento que conecta base, postura e controle. Quem perde o equilíbrio perde a capacidade de atacar e defender simultaneamente.',
      ],
      keyPoints: [
        'Base sólida impede quedas e economiza energia',
        'Postura protege contra ataques do adversário',
        'Controle é dominar espaço e tempo',
        'Equilíbrio conecta todos os fundamentos',
      ],
    },
  },
  {
    id: 'conceitos',
    icon: Brain,
    title: 'Conceitos Essenciais',
    description: 'Alavanca, tempo, espaço e pressão.',
    accent: '#A0845C',
    accentDark: '#7A6340',
    content: {
      intro: 'Os conceitos essenciais são os pilares invisíveis que sustentam toda técnica do treinamento especializado.',
      paragraphs: [
        'Alavanca permite vencer força maior com esforço menor. É o princípio que torna o treinamento especializado eficiente — usando pontos de apoio estratégicos, um praticante menor pode controlar e finalizar um oponente maior.',
        'Tempo é agir no momento certo. No treinamento especializado, uma técnica aplicada no timing perfeito vale mais que dez tentativas forçadas. Saber quando agir e quando esperar é o que separa o praticante técnico do atleta que apenas se esforça.',
        'Espaço define mobilidade e defesa. Criar espaço permite escapar; negar espaço impede que o adversário se mova. O jogo de espaço é constante e estratégico.',
        'Pressão quebra resistência física e mental do oponente. Não é força bruta — é peso distribuído nos pontos certos, tornando cada segundo desconfortável para quem está embaixo.',
      ],
      keyPoints: [
        'Alavanca: vencer força com técnica',
        'Tempo: agir no momento exato',
        'Espaço: controlar mobilidade',
        'Pressão: desgastar física e mentalmente',
      ],
    },
  },
  {
    id: 'regras',
    icon: Users,
    title: 'Regras e Ética no Ambiente',
    description: 'Conduta, respeito e hierarquia.',
    accent: '#8FAF7A',
    accentDark: '#5E7A4A',
    content: {
      intro: 'O ambiente é um espaço de respeito mútuo. As regras existem para proteger todos e manter a integridade da arte.',
      paragraphs: [
        'Cumprimentar antes e depois do treino é tradição fundamental. O cumprimento demonstra respeito pelo parceiro, pelo instrutor e pela arte. Ignorar essa prática é desrespeitar a cultura do treinamento especializado.',
        'Respeitar a graduação é reconhecer a jornada de cada praticante. A nivel não representa apenas habilidade técnica — representa tempo dedicado, dificuldades superadas e evolução pessoal.',
        'Evitar força desnecessária é proteger seu parceiro de treino. O objetivo do treino é aprender, não machucar. Força excessiva impede aprendizado e cria um ambiente hostil.',
        'Zelar pelo parceiro de treino é zelar por você mesmo. Quando cuidamos da integridade física do companheiro, criamos um ambiente onde todos evoluem juntos.',
      ],
      keyPoints: [
        'Cumprimentar antes e depois de cada treino',
        'Respeitar a graduação e hierarquia',
        'Evitar força desnecessária',
        'Zelar pelo parceiro de treino',
      ],
    },
  },
  {
    id: 'historia',
    icon: BookOpen,
    title: 'História e Filosofia',
    description: 'Origem e valores do treinamento especializado.',
    accent: '#C4956A',
    accentDark: '#8B5A2B',
    content: {
      intro: 'Conhecer a história do treinamento especializado é entender por que treinamos do jeito que treinamos.',
      paragraphs: [
        'O treinamento especializado surgiu no Japão como um sistema de combate para samurais desarmados. As técnicas foram desenvolvidas para situações onde a espada não podia ser usada — priorizando quedas, imobilizações e finalizações.',
        'A arte evoluiu no Brasil através da família Gracie, que adaptou as técnicas japonesas para enfatizar o combate no solo. O artes marciais e desenvolvimento pessoal se tornou uma das artes marciais mais eficientes do mundo.',
        'A plataforma de gestão valoriza eficiência, disciplina e humildade. O nome "treinamento especializado" significa literalmente "plataforma de gestão" — não porque seja fácil, mas porque usa inteligência e técnica em vez de força bruta.',
        'O objetivo é evolução pessoal contínua. No treinamento especializado, a nível máximo não é o fim — é o verdadeiro início da compreensão. A jornada de aprendizado nunca termina.',
      ],
      keyPoints: [
        'Origem no Japão, evolução no Brasil',
        'A plataforma de gestão: inteligência sobre força',
        'Eficiência, disciplina e humildade',
        'Evolução pessoal contínua',
      ],
    },
  },
  {
    id: 'mental',
    icon: Heart,
    title: 'Preparação Mental',
    description: 'Disciplina e constância.',
    accent: '#C47A6A',
    accentDark: '#8B3A2B',
    content: {
      intro: 'O maior adversário não está no ambiente — está na sua cabeça.',
      paragraphs: [
        'Treinar cansado ensina mais que treinar motivado. É nos dias difíceis que o verdadeiro aprendizado acontece. A técnica desenvolvida sob fadiga é a mais honesta.',
        'Consistência vence talento. O praticante que treina três vezes por semana durante anos supera aquele que treina intensamente por meses e depois para. O treinamento especializado é uma maratona, não uma corrida.',
        'A mente desiste antes do corpo. Quando você acha que não aguenta mais, seu corpo ainda tem reservas. Aprender a ultrapassar esse limite mental é uma das maiores lições do ambiente.',
        'A resiliência desenvolvida no treino se transfere para a vida. Quem aprende a resolver problemas sob pressão no ambiente leva essa habilidade para o trabalho, relacionamentos e desafios pessoais.',
      ],
      keyPoints: [
        'Treinar cansado desenvolve técnica real',
        'Consistência vence talento natural',
        'A mente desiste antes do corpo',
        'Resiliência do ambiente para a vida',
      ],
    },
  },
  {
    id: 'seguranca',
    icon: Shield,
    title: 'Segurança e Prevenção',
    description: 'Prevenção de lesões.',
    accent: '#7AAFAA',
    accentDark: '#4A7A76',
    content: {
      intro: 'Treinar com inteligência garante que você possa treinar por décadas, não apenas meses.',
      paragraphs: [
        'Aquecer reduz significativamente o risco de lesões. Músculos e articulações preparados respondem melhor ao estresse do treino. Nunca pule o aquecimento — são os minutos mais importantes do dia.',
        'Bater (tap) antes de sentir dor é a regra de ouro da segurança. O tap existe para proteger você. Esperar até sentir dor significa que a lesão já pode ter começado. Não há vergonha em bater — há inteligência.',
        'Respeitar os limites do corpo é essencial para a longevidade. Treinar lesionado agrava o problema e pode afastar você do ambiente por meses. Saber parar é tão importante quanto saber lutar.',
        'Hidratação, alimentação adequada e descanso são parte do treino. Seu corpo precisa de combustível e recuperação para evoluir. Negligenciar esses aspectos é sabotar seu próprio progresso.',
      ],
      keyPoints: [
        'Aquecimento reduz risco de lesões',
        'Bater (tap) antes de sentir dor',
        'Respeitar limites do corpo',
        'Descanso e recuperação fazem parte',
      ],
    },
  },
];

export function getAreaById(id: string): AcademyArea | undefined {
  return ACADEMY_AREAS.find(a => a.id === id);
}
