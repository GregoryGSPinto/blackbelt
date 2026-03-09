export function leadProposalEmail(params: {
  responsibleName: string;
  academyName: string;
  proposalValue: string;
  proposalUrl: string;
}) {
  return `
  <div style="font-family:Arial,sans-serif;background:#0f172a;padding:32px;color:#e2e8f0">
    <div style="max-width:640px;margin:0 auto;background:#111827;border:1px solid #334155;border-radius:16px;padding:32px">
      <p style="margin:0 0 8px;color:#f59e0b;text-transform:uppercase;font-size:12px;letter-spacing:.18em">BlackBelt</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#fff">Proposta comercial</h1>
      <p style="margin:0 0 16px">Olá ${params.responsibleName},</p>
      <p style="margin:0 0 16px">
        Preparamos uma proposta para a academia <strong>${params.academyName}</strong>.
      </p>
      <p style="margin:0 0 24px">
        Valor proposto: <strong>${params.proposalValue}</strong>
      </p>
      <a href="${params.proposalUrl}" style="display:inline-block;background:#f59e0b;color:#111827;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">
        Abrir proposta em PDF
      </a>
      <p style="margin:24px 0 0;color:#94a3b8;font-size:14px">
        Plataforma SaaS para gestao de academias, financeiro, check-in e growth intelligence.
      </p>
    </div>
  </div>`;
}
