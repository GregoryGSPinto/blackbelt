/**
 * academyTests — Perguntas de conhecimento por área
 * TODO(FE-032): Substituir por GET /academy/tests (gerenciado pelo instrutor)
 */

export interface TestQuestion {
  id: string;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string; // label: 'A' | 'B' | 'C'
}

export interface AreaTest {
  areaId: string;
  questions: TestQuestion[];
}

export const ACADEMY_TESTS: AreaTest[] = [
  {
    areaId: 'fundamentos',
    questions: [
      {
        id: 'fund-1',
        question: 'Qual é o objetivo da base no treinamento especializado?',
        options: [
          { label: 'A', text: 'Gastar força rapidamente' },
          { label: 'B', text: 'Evitar quedas e manter estabilidade' },
          { label: 'C', text: 'Finalizar o mais rápido possível' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'fund-2',
        question: 'O que a postura protege no ambiente?',
        options: [
          { label: 'A', text: 'Apenas o pescoço' },
          { label: 'B', text: 'Contra ataques do adversário' },
          { label: 'C', text: 'O instrutor' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  {
    areaId: 'conceitos',
    questions: [
      {
        id: 'conc-1',
        question: 'O que é alavanca no treinamento especializado?',
        options: [
          { label: 'A', text: 'Usar força explosiva' },
          { label: 'B', text: 'Vencer força maior com técnica e posicionamento' },
          { label: 'C', text: 'Velocidade máxima' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'conc-2',
        question: 'O que significa pressão no contexto do treinamento especializado?',
        options: [
          { label: 'A', text: 'Empurrar o mais rápido possível' },
          { label: 'B', text: 'Cansar o adversário física e mentalmente' },
          { label: 'C', text: 'Respirar com força' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  {
    areaId: 'regras',
    questions: [
      {
        id: 'regr-1',
        question: 'O que se deve fazer antes do treino?',
        options: [
          { label: 'A', text: 'Ignorar o parceiro' },
          { label: 'B', text: 'Cumprimentar' },
          { label: 'C', text: 'Discutir técnicas' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'regr-2',
        question: 'A graduação (nível) indica principalmente:',
        options: [
          { label: 'A', text: 'Tempo de dedicação e evolução' },
          { label: 'B', text: 'Peso do praticante' },
          { label: 'C', text: 'Idade do praticante' },
        ],
        correctAnswer: 'A',
      },
    ],
  },
  {
    areaId: 'historia',
    questions: [
      {
        id: 'hist-1',
        question: 'Onde evoluiu o treinamento especializado moderno (BlackBelt)?',
        options: [
          { label: 'A', text: 'Japão' },
          { label: 'B', text: 'Brasil' },
          { label: 'C', text: 'Estados Unidos' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'hist-2',
        question: 'Qual é o principal valor do treinamento especializado?',
        options: [
          { label: 'A', text: 'Força bruta' },
          { label: 'B', text: 'Humildade' },
          { label: 'C', text: 'Velocidade' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  {
    areaId: 'mental',
    questions: [
      {
        id: 'ment-1',
        question: 'O que vence o talento natural?',
        options: [
          { label: 'A', text: 'Sorte' },
          { label: 'B', text: 'Consistência' },
          { label: 'C', text: 'Descanso' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'ment-2',
        question: 'Quem desiste primeiro?',
        options: [
          { label: 'A', text: 'O corpo' },
          { label: 'B', text: 'A mente' },
          { label: 'C', text: 'O instrutor' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
  {
    areaId: 'seguranca',
    questions: [
      {
        id: 'segu-1',
        question: 'Quando se deve bater (tap)?',
        options: [
          { label: 'A', text: 'Após lesionar' },
          { label: 'B', text: 'Antes de sentir dor' },
          { label: 'C', text: 'Nunca' },
        ],
        correctAnswer: 'B',
      },
      {
        id: 'segu-2',
        question: 'Para que serve o aquecimento?',
        options: [
          { label: 'A', text: 'Para cansar antes do treino' },
          { label: 'B', text: 'Para evitar lesões' },
          { label: 'C', text: 'Para punir atrasados' },
        ],
        correctAnswer: 'B',
      },
    ],
  },
];

export function getTestByAreaId(areaId: string): AreaTest | undefined {
  return ACADEMY_TESTS.find(t => t.areaId === areaId);
}
