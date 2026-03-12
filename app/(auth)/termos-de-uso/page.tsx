'use client';

import Link from 'next/link';

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/login" className="text-amber-400 hover:text-amber-300 text-sm mb-8 inline-block">
          &larr; Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-gray-400 mb-8">Ultima atualizacao: 6 de Marco de 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceitacao dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma BlackBelt (&quot;Plataforma&quot;), voce concorda com estes
              Termos de Uso. Se voce nao concordar com qualquer parte destes termos, nao utilize a
              Plataforma. O uso continuado apos alteracoes constitui aceitacao dos termos revisados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descricao do Servico</h2>
            <p>
              A BlackBelt e uma plataforma SaaS de gestao para academias de artes marciais, oferecendo:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Gestao de alunos, turmas e graduacoes</li>
              <li>Check-in e registro de presenca</li>
              <li>Controle financeiro e cobrancas</li>
              <li>Comunicacao entre academia, professores e alunos</li>
              <li>Acompanhamento de progresso e gamificacao</li>
              <li>Aplicativo mobile para iOS e Android</li>
              <li>Perfis especializados: Admin, Professor, Aluno Adulto, Teen, Kids e Responsavel</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cadastro e Conta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>O cadastro e obrigatorio para uso da Plataforma</li>
              <li>Voce e responsavel por manter a confidencialidade de suas credenciais</li>
              <li>Informacoes fornecidas devem ser precisas e atualizadas</li>
              <li>Contas de menores de 18 anos requerem consentimento do responsavel legal</li>
              <li>E proibido compartilhar credenciais ou permitir acesso nao autorizado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Planos e Pagamentos</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Oferecemos diferentes planos adaptados as necessidades da sua academia</li>
              <li>Consulte nossos valores diretamente com nosso time comercial ou atraves da pagina de precos</li>
              <li>Periodo de teste gratuito disponivel para conhecer a plataforma</li>
              <li>Pagamentos podem ser processados por parceiro de cobranca configurado pela BlackBelt</li>
              <li>Renovacao automatica ate cancelamento pelo titular</li>
              <li>Cancelamento pode ser feito a qualquer momento nas configuracoes da conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Uso Aceitavel</h2>
            <p>Ao utilizar a Plataforma, voce concorda em NAO:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Violar leis ou regulamentos aplicaveis</li>
              <li>Transmitir conteudo ofensivo, difamatorio ou ilegal</li>
              <li>Tentar acessar contas ou dados de outros usuarios sem autorizacao</li>
              <li>Realizar engenharia reversa ou descompilar a Plataforma</li>
              <li>Utilizar a Plataforma para fins diferentes da gestao de academias</li>
              <li>Sobrecarregar a infraestrutura com requisicoes automatizadas excessivas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteudo da Plataforma — incluindo codigo, design, marca, textos e funcionalidades —
              e de propriedade exclusiva da BlackBelt ou de seus licenciadores. O uso da Plataforma nao
              confere nenhum direito de propriedade intelectual sobre o servico.
            </p>
            <p className="mt-2">
              O conteudo gerado por usuarios (dados de alunos, turmas, etc.) permanece de propriedade
              do usuario, estando sujeito a nossa Politica de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Disponibilidade e SLA</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Buscamos manter alta disponibilidade e previsibilidade operacional</li>
              <li>Manutencoes programadas serao comunicadas com antecedencia</li>
              <li>Nao garantimos disponibilidade ininterrupta</li>
              <li>Rotinas de backup e recuperacao dependem do ambiente contratado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitacao de Responsabilidade</h2>
            <p>
              A BlackBelt nao se responsabiliza por danos indiretos, incidentais ou consequentes
              decorrentes do uso ou impossibilidade de uso da Plataforma. Nossa responsabilidade
              total esta limitada ao valor pago pelo servico nos ultimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Rescisao</h2>
            <p>
              Podemos suspender ou encerrar sua conta em caso de violacao destes Termos. Voce pode
              encerrar sua conta a qualquer momento. Apos o encerramento, seus dados serao tratados
              conforme nossa Politica de Privacidade e a LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Legislacao Aplicavel</h2>
            <p>
              Estes Termos sao regidos pelas leis da Republica Federativa do Brasil. Qualquer disputa
              sera submetida ao foro da comarca de Sao Paulo/SP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contato</h2>
            <p>
              Para duvidas sobre estes Termos de Uso:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <span className="text-amber-400">contato@blackbelt.app</span></li>
              <li>Suporte: <span className="text-amber-400">suporte@blackbelt.app</span></li>
            </ul>
          </section>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <p className="text-sm text-gray-400">
            Ao utilizar a BlackBelt, voce declara ter lido e concordado com estes Termos de Uso e com
            nossa <Link href="/politica-privacidade" className="text-amber-400 hover:text-amber-300">Politica de Privacidade</Link>.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; 2026 BlackBelt. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
