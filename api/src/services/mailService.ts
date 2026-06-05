import { env } from '../config/env';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const fetchFn: typeof fetch | undefined = (globalThis as any).fetch;
  if (!fetchFn) {
    throw new Error('global fetch is not available. Upgrade to Node 18+ or install node-fetch and set globalThis.fetch.');
  }

  const resetUrl = `${env.FRONTEND_URL}/reset-password?t=${token}`;
  const htmlContent = `
    <p>Has solicitado reiniciar tu contraseña. Haz clic en el enlace para continuar:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>Si no solicitaste esto, ignora este correo.</p>
  `;

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
