import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

export interface CorreoData {
  to: string;
  subject: string;
  text: string;
}

export const sendMassEmails = async (correos: CorreoData[]) => {
  let transporter;

  // Si no hay configuración SMTP, usamos Ethereal para pruebas (imprime enlace en consola)
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('No SMTP config found. Creating test Ethereal account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } else {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // True para 465, false para otros (587)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }

  const defaultFrom = SMTP_FROM || '"Plataforma TEC" <no-responder@tecuct.cl>';

  let exitosos = 0;
  let fallidos = 0;
  let previewUrl = '';

  // Enviar correos de a uno. Si son miles, se puede optimizar con Promise.all() + chunking.
  for (const correo of correos) {
    try {
      const info = await transporter.sendMail({
        from: defaultFrom,
        to: correo.to,
        subject: correo.subject,
        text: correo.text
      });
      exitosos++;
      
      // Si estamos en Ethereal, obtenemos la URL del primer correo para inspeccionarlo.
      if (!SMTP_HOST && !previewUrl) {
        previewUrl = nodemailer.getTestMessageUrl(info) as string;
      }
    } catch (error) {
      console.error(`Error enviando correo a ${correo.to}:`, error);
      fallidos++;
    }
  }

  return { exitosos, fallidos, previewUrl };
};
