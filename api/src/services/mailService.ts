import { env } from '../config/env';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const fetchFn: typeof fetch | undefined = (globalThis as any).fetch;
  if (!fetchFn) {
    throw new Error('global fetch is not available. Upgrade to Node 18+ or install node-fetch and set globalThis.fetch.');
  }

  const resetUrl = `${env.FRONTEND_URL}/reset-password?t=${token}`;
  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Restablecer contraseña</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:28px 32px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">SISTRA-TEC</p>
              <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa;">Sistema de Trazabilidad de Campañas Humanitarias</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#18181b;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#18181b;line-height:1.6;">
                Haz clic en el botón para continuar. Este enlace es válido por <strong>1 hora</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:6px;background-color:#18181b;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:13px;color:#71717a;line-height:1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#71717a;word-break:break-all;">
                <a href="${resetUrl}" style="color:#71717a;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const payload = {
    sender: {
      name: env.EMAIL_FROM_NAME,
      email: env.EMAIL_FROM_EMAIL
    },
    to: [
      {
        email: to
      }
    ],
    subject: 'Restablece tu contraseña',
    htmlContent
  };

  const res = await fetchFn(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${text}`);
  }
};
