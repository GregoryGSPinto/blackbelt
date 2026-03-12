'use client';

import Link from 'next/link';

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/login" className="text-amber-400 hover:text-amber-300 text-sm mb-8 inline-block">
          &larr; Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-2">Politica de Privacidade</h1>
        <p className="text-gray-400 mb-8">Ultima atualizacao: 6 de Marco de 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introducao</h2>
            <p>
              A BlackBelt (&quot;nos&quot;, &quot;nosso&quot; ou &quot;Plataforma&quot;) esta comprometida com a protecao
              da privacidade e dos dados pessoais de seus usuarios, em conformidade com a Lei Geral de
              Protecao de Dados Pessoais (LGPD — Lei n. 13.709/2018).
            </p>
            <p className="mt-2">
              Esta politica descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais
              ao utilizar nossa plataforma de gestao de academias de artes marciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados Coletados</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Dados de identificacao: nome completo, email, telefone, data de nascimento</li>
              <li>Dados de acesso: endereco IP, tipo de dispositivo, navegador, horarios de acesso</li>
              <li>Dados academicos: graduacao, frequencia, historico de treinos, conquistas</li>
              <li>Dados financeiros: historico de pagamentos (processados via Stripe — nao armazenamos dados de cartao)</li>
              <li>Dados de menores: coletados apenas com consentimento do responsavel legal</li>
              <li>Dados de autenticacao local do dispositivo: biometria opcional processada pelo proprio iOS/Android, sem armazenamento biometrico pelo BlackBelt</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidade do Tratamento</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gerenciamento de matriculas e frequencia</li>
              <li>Processamento de pagamentos e cobrancas</li>
              <li>Comunicacao entre academia, professores, alunos e responsaveis</li>
              <li>Acompanhamento de progresso e graduacoes</li>
              <li>Melhoria continua da plataforma e experiencia do usuario</li>
              <li>Cumprimento de obrigacoes legais e regulatorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Base Legal</h2>
            <p>
              O tratamento de dados pessoais e realizado com base no consentimento do titular,
              na execucao de contrato, no cumprimento de obrigacao legal e no legitimo interesse
              do controlador, conforme previsto nos artigos 7 e 11 da LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Compartilhamento de Dados</h2>
            <p>Seus dados podem ser compartilhados com:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>A academia de artes marciais a qual voce esta vinculado</li>
              <li>Processadores de pagamento (Stripe) para transacoes financeiras</li>
              <li>Servicos de infraestrutura e observabilidade contratados para operar a plataforma</li>
              <li>Autoridades competentes, quando exigido por lei</li>
            </ul>
            <p className="mt-2">Nao vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Protecao de Dados de Menores</h2>
            <p>
              A BlackBelt adota medidas especiais para protecao de dados de criancas (Kids, 4-11 anos)
              e adolescentes (Teen, 12-17 anos), conforme artigo 14 da LGPD:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Coleta apenas com consentimento verificavel do responsavel legal</li>
              <li>Acesso restrito do responsavel ao perfil do menor</li>
              <li>Interface adaptada sem coleta excessiva de dados</li>
              <li>Redacao de informacoes pessoais em logs de auditoria</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Direitos do Titular</h2>
            <p>Conforme a LGPD, voce tem direito a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Confirmar a existencia de tratamento de seus dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar anonimizacao, bloqueio ou eliminacao de dados</li>
              <li>Solicitar portabilidade dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar exclusao completa da conta e dados</li>
            </ul>
            <p className="mt-2">
              Para exercer seus direitos, acesse <strong>Configuracoes &gt; Excluir minha conta</strong> no
              app ou entre em contato pelo email <span className="text-amber-400">privacidade@blackbelt.app</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Seguranca</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Criptografia TLS em todas as comunicacoes</li>
              <li>Tokens de acesso em memoria (nunca em localStorage)</li>
              <li>Row Level Security (RLS) no banco de dados</li>
              <li>Auditoria de acessos e acoes senssiveis</li>
              <li>Rate limiting para prevencao de ataques</li>
              <li>Autenticacao biometrica opcional no dispositivo, quando disponivel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Retencao de Dados</h2>
            <p>
              Seus dados sao retidos enquanto sua conta estiver ativa. Apos solicitacao de exclusao,
              os dados entram em fila de revisao e sao removidos ou anonimizados conforme a base legal aplicavel,
              exceto quando houver obrigacao legal de retencao.
              Dados anonimizados podem ser mantidos para fins estatisticos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contato</h2>
            <p>
              Para duvidas sobre esta politica ou sobre o tratamento de seus dados, entre em contato:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <span className="text-amber-400">privacidade@blackbelt.app</span></li>
              <li>Encarregado de Dados (DPO): <span className="text-amber-400">dpo@blackbelt.app</span></li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; 2026 BlackBelt. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
