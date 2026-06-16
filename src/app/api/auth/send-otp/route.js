import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const secret = process.env.OTP_SECRET || 'zuca_portal_secure_otp_secret_key_12345';

// SMTP Configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || 'kukula@goldenkicks.co.mz';
const smtpPass = process.env.SMTP_PASS;
const senderEmail = process.env.SENDER_EMAIL || smtpUser;

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    // 1. Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Set expiration time (5 minutes from now)
    const expires = Date.now() + 5 * 60 * 1000;
    
    // 3. Create cryptographic signature to prevent tampering
    const data = `${email}:${otp}:${expires}`;
    const hash = crypto.createHmac('sha256', secret).update(data).digest('hex');
    const token = `${expires}.${hash}`;

    let emailSent = false;
    let errorDetail = null;

    // 4. Send email using Nodemailer SMTP if configured
    if (smtpHost && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465, // True for 465 SSL, false for TLS (587)
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          tls: {
            rejectUnauthorized: false // Helps bypass SSL trust issues on custom mail servers
          }
        });

        await transporter.sendMail({
          from: `"Portal Zuca" <${senderEmail}>`,
          to: email,
          subject: 'Código de Confirmação OTP - Portal Zuca',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #2a2a2a;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #00FF88; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px;">ZUCA<span style="color: #ffffff;">.</span></h1>
                <p style="color: #888888; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Portal de Serviços de Moçambique</p>
              </div>
              <div style="background-color: #1e1e1e; padding: 35px; border-radius: 12px; border: 1px solid #2a2a2a; text-align: center;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: bold;">Verificação de Segurança</h2>
                <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin-bottom: 25px;">
                  Use o código de uso único abaixo para autorizar o seu login no Portal Zuca. Este código expira em 5 minutos.
                </p>
                <div style="background-color: #121212; border: 1px solid #00FF88; color: #00FF88; font-size: 36px; font-weight: 900; padding: 15px 35px; border-radius: 10px; display: inline-block; letter-spacing: 6px; font-family: monospace;">
                  ${otp}
                </div>
                <p style="color: #ef4444; font-size: 11px; margin-top: 25px; margin-bottom: 0;">
                  Se não tentou entrar na sua conta, por favor ignore este email.
                </p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #666666; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Portal Zuca. Todos os direitos reservados.
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP Mailer Error:', err);
        errorDetail = err.message;
      }
    }

    // Output secure debug logs to server output/Vercel console
    console.log(`\n=================== OTP SECURITY LOG ===================\nRECIPIENT: ${email}\nOTP CODE: ${otp}\nSTATUS: ${emailSent ? 'SENT VIA SMTP' : 'SIMULATION MODE (SMTP Config Missing/Failed)'}\nERROR DETAIL: ${errorDetail || 'None'}\n======================================================\n`);

    const response = NextResponse.json({ 
      success: true, 
      message: emailSent 
        ? 'Código de confirmação enviado para o seu e-mail.' 
        : 'Modo de simulação ativo. O código de segurança foi enviado para os logs do servidor.'
    });

    // Set signed session cookie
    response.cookies.set('otp_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 300 // 5 minutes
    });

    return response;
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Erro ao processar OTP' }, { status: 500 });
  }
}
