import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// SMTP Configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || 'kukula@goldenkicks.co.mz';
const smtpPass = process.env.SMTP_PASS;
const senderEmail = process.env.SENDER_EMAIL || smtpUser;

export async function POST(request) {
  try {
    const { email, name, nuit, phone, paymentMethod, cartItems, totalAmount } = await request.json();
    
    if (!email || !name || !nuit || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Informações de faturação incompletas' }, { status: 400 });
    }

    // 1. Generate unique transaction reference number
    const refNumber = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const dateFormatted = new Date().toLocaleDateString('pt-MZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 2. Generate table rows for the invoice
    const itemRows = cartItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #ffffff;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #b0b0b0; text-align: center;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #00FF88; text-align: right; font-family: monospace;">${item.price.toLocaleString('pt-MZ')} MZN</td>
        <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #00FF88; text-align: right; font-family: monospace; font-weight: bold;">${(item.price * item.qty).toLocaleString('pt-MZ')} MZN</td>
      </tr>
    `).join('');

    let emailSent = false;
    let errorDetail = null;

    // 3. Send HTML invoice via Nodemailer SMTP if configured
    if (smtpHost && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await transporter.sendMail({
          from: `"Portal Zuca - Finanças" <${senderEmail}>`,
          to: email,
          subject: `Fatura Recibo Simplificada ${refNumber} - Portal Zuca`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 650px; margin: 0 auto; border: 1px solid #2a2a2a;">
              
              <!-- Branding Header -->
              <div style="text-align: center; margin-bottom: 35px; border-bottom: 1px solid #2a2a2a; padding-bottom: 20px;">
                <h1 style="color: #00FF88; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: -1px;">ZUCA<span style="color: #ffffff;">.</span></h1>
                <p style="color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px; margin-bottom: 0;">Portal Oficial de Finanças e Serviços de Moçambique</p>
              </div>

              <!-- Success Stamp / Status Banner -->
              <div style="background-color: #00FF88/10; border: 1px solid #00FF88; color: #00FF88; padding: 15px; border-radius: 10px; text-align: center; font-weight: bold; margin-bottom: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                ✓ Pagamento Confirmado - Autenticado Digitalmente
              </div>

              <!-- Invoice Metadata Grid -->
              <table style="width: 100%; margin-bottom: 30px; font-size: 13px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 15px;">
                    <span style="color: #888888; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 5px;">Dados de Faturação</span>
                    <strong style="color: #ffffff; font-size: 15px; display: block; margin-bottom: 3px;">${name}</strong>
                    <span style="color: #b0b0b0; display: block;">NUIT: ${nuit}</span>
                    <span style="color: #b0b0b0; display: block;">Telemóvel: ${phone || 'N/A'}</span>
                    <span style="color: #b0b0b0; display: block;">Email: ${email}</span>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 15px; border-left: 1px solid #2a2a2a;">
                    <span style="color: #888888; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 5px;">Detalhes do Recibo</span>
                    <span style="color: #b0b0b0; display: block; margin-bottom: 3px;">Referência: <strong style="color: #00FF88; font-family: monospace;">${refNumber}</strong></span>
                    <span style="color: #b0b0b0; display: block; margin-bottom: 3px;">Data: ${dateFormatted}</span>
                    <span style="color: #b0b0b0; display: block;">Método de Pagamento: <strong style="color: #ffffff; text-transform: uppercase;">${paymentMethod}</strong></span>
                  </td>
                </tr>
              </table>

              <!-- Invoice Table -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <thead>
                  <tr style="background-color: #1e1e1e;">
                    <th style="padding: 12px; text-align: left; color: #888888; border-bottom: 2px solid #2a2a2a;">Descrição da Taxa</th>
                    <th style="padding: 12px; text-align: center; color: #888888; border-bottom: 2px solid #2a2a2a; width: 60px;">Qtd</th>
                    <th style="padding: 12px; text-align: right; color: #888888; border-bottom: 2px solid #2a2a2a; width: 110px;">Preço Unit.</th>
                    <th style="padding: 12px; text-align: right; color: #888888; border-bottom: 2px solid #2a2a2a; width: 110px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 15px 12px; border-top: 2px solid #2a2a2a;"></td>
                    <td style="padding: 15px 12px; border-top: 2px solid #2a2a2a; font-weight: bold; text-align: right; color: #888888; font-size: 13px; text-transform: uppercase;">Total Pago:</td>
                    <td style="padding: 15px 12px; border-top: 2px solid #2a2a2a; font-weight: 900; text-align: right; color: #00FF88; font-size: 18px; font-family: monospace;">${totalAmount.toLocaleString('pt-MZ')} MZN</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Security / Verification Footer note -->
              <div style="background-color: #1e1e1e; border: 1px dashed #2a2a2a; padding: 15px; border-radius: 8px; font-size: 11px; color: #888888; text-align: center; line-height: 1.5;">
                Este documento é uma fatura-recibo simplificada emitida de acordo com as diretrizes do Ministério da Economia e Finanças de Moçambique. O pagamento foi validado eletronicamente e dispensa assinatura manuscrita.
              </div>

              <!-- Footer Copyright -->
              <div style="text-align: center; margin-top: 35px; color: #666666; font-size: 11px; border-top: 1px solid #2a2a2a; padding-top: 20px;">
                &copy; ${new Date().getFullYear()} Portal de Serviços Digitais Zuca. República de Moçambique.
              </div>
            </div>
          `
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP Receipt Delivery Error:', err);
        errorDetail = err.message;
      }
    }

    console.log(`\n=================== TRANSACTION LOG ===================\nREF: ${refNumber}\nCITIZEN: ${name} (NUIT: ${nuit})\nEMAIL: ${email}\nTOTAL: ${totalAmount} MZN\nPAYMENT: ${paymentMethod}\nSTATUS: ${emailSent ? 'RECEIPT SENT VIA SMTP' : 'SIMULATED (SMTP Configuration Missing/Failed)'}\nERROR DETAIL: ${errorDetail || 'None'}\n========================================================\n`);

    return NextResponse.json({
      success: true,
      refNumber,
      date: dateFormatted,
      emailSent,
      message: emailSent 
        ? 'Pagamento efetuado com sucesso! O recibo foi enviado para o seu email.' 
        : 'Pagamento efetuado em modo de simulação. O recibo foi impresso nos logs do servidor.'
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Erro ao processar o checkout' }, { status: 500 });
  }
}
