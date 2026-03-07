export function welcomeEmail(params: { nome: string; academyName: string }): string {
  const { nome, academyName } = params;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao BlackBelt</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d1a;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d1a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1a1a2e;border-radius:12px;overflow:hidden;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:40px 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:32px;font-weight:bold;color:#f59e0b;letter-spacing:2px;">
                    BLACKBELT
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:12px;color:#a0a0b0;letter-spacing:4px;padding-top:4px;">
                    PLATAFORMA DE GESTAO
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#f59e0b,transparent);"></div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:24px;color:#ffffff;font-weight:600;">
                Bem-vindo, ${nome}!
              </h1>
              <p style="margin:0 0 16px;font-size:16px;color:#d0d0e0;line-height:1.6;">
                Estamos muito felizes em ter voce na <strong style="color:#f59e0b;">${academyName}</strong>!
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#d0d0e0;line-height:1.6;">
                Sua conta foi criada com sucesso. Agora voce pode acessar a plataforma BlackBelt e aproveitar todos os recursos disponiveis para sua evolucao.
              </p>
              <p style="margin:0 0 32px;font-size:16px;color:#d0d0e0;line-height:1.6;">
                Comece explorando seu painel, registrando presenca e acompanhando seu progresso nas artes marciais.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#f59e0b;border-radius:8px;">
                    <a href="https://blackbelt-five.vercel.app/login"
                       style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:bold;color:#0d0d1a;text-decoration:none;border-radius:8px;">
                      Acessar Plataforma
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,#333,transparent);"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 40px;">
              <p style="margin:0 0 8px;font-size:12px;color:#666;text-align:center;">
                Este email foi enviado por BlackBelt - Plataforma de Gestao
              </p>
              <p style="margin:0;font-size:12px;color:#666;text-align:center;">
                <a href="https://blackbelt-five.vercel.app/configuracoes" style="color:#f59e0b;text-decoration:underline;">
                  Cancelar inscricao
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
