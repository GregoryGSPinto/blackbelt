/**
 * __mocks__ — Dados mock para desenvolvimento
 *
 * ⚠️  NUNCA importe deste diretório em componentes de UI.
 *     Use sempre os services em lib/api/*.service.ts.
 *
 * Estes módulos são consumidos exclusivamente pela camada de service
 * quando useMock() === true.
 */

export * as contentMock from './content.mock';
export * as adminMock from './admin.mock';
export * as kidsMock from './kids.mock';
export * as shopMock from './shop.mock';
export * as teenMock from './teen.mock';
export * as authMock from './auth.mock';
export * as professorMock from './instrutor.mock';
export * as rankingMock from './ranking.mock';
export * as carteirinhaMock from './carteirinha.mock';
export * as eventosMock from './eventos.mock';
export * as automacoesMock from './automacoes.mock';
export * as relatoriosMock from './relatorios.mock';
export * as assinaturaMock from './assinatura.mock';
export * as graduacaoMock from './graduacao.mock';
export * as analyticsMock from './analytics.mock';
export * as kidsSafetyMock from './kids-safety.mock';
export * as planoAulaMock from './plano-aula.mock';
