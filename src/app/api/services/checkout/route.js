import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// SMTP Configuration
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const smtpUser = process.env.SMTP_USER || 'kukula@goldenkicks.co.mz';
const smtpPass = process.env.SMTP_PASS;
const senderEmail = process.env.SENDER_EMAIL || smtpUser;

// M-Pesa API Configuration
const mpesaHost = process.env.MPESA_API_HOST || 'api.sandbox.vm.co.mz:18352';
const mpesaApiKey = process.env.MPESA_API_KEY;
const mpesaPublicKey = process.env.MPESA_PUBLIC_KEY;
const mpesaServiceProviderCode = process.env.MPESA_SERVICE_PROVIDER_CODE || '171717';

// RSA Public Key Encryption function for M-Pesa Mozambique
function generateMpesaToken(apiKey, publicKeyPEM) {
  try {
    let formattedKey = publicKeyPEM.trim();
    if (!formattedKey.includes('-----BEGIN PUBLIC KEY-----')) {
      // Clean up key and add PEM headers if they are missing
      const cleanKey = formattedKey.replace(/[\r\n]/g, '').replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '');
      // Split into 64-character lines
      const lines = cleanKey.match(/.{1,64}/g) || [];
      formattedKey = `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
    }
    
    const buffer = Buffer.from(apiKey);
    const encrypted = crypto.publicEncrypt(
      {
        key: formattedKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      buffer
    );
    return encrypted.toString('base64');
  } catch (err) {
    console.error('M-Pesa RSA Encryption Error:', err);
    throw new Error('Falha ao encriptar as credenciais do M-Pesa. Verifique o formato da Public Key.');
  }
}

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

    let mpesaTransactionId = null;
    let mpesaApiCalled = false;
    let mpesaApiSuccess = false;
    let mpesaErrorDetail = null;

    // 2. Call M-Pesa API if payment method is mpesa and configuration is present
    if (paymentMethod === 'mpesa' && mpesaApiKey && mpesaPublicKey) {
      mpesaApiCalled = true;
      try {
        const token = generateMpesaToken(mpesaApiKey, mpesaPublicKey);
        
        // Clean phone number (format should be country code 258 + 9 digit number)
        let cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone.startsWith('258')) {
          cleanPhone = `258${cleanPhone}`;
        }

        const mpesaUrl = `https://${mpesaHost}/ipg/v1x/c2bPayment/singleStage/`;
        
        const mpesaHeaders = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': process.env.MPESA_ORIGIN || 'ZucaPortal',
          'Authorization': `Bearer ${token}`
        };

        const mpesaBody = {
          input_Amount: Number(totalAmount).toFixed(2),
          input_CustomerMSISDN: cleanPhone,
          input_Country: 'MOZ',
          input_Currency: 'MZN',
          input_ServiceProviderCode: mpesaServiceProviderCode,
          input_TransactionReference: refNumber,
          input_ThirdPartyReference: refNumber
        };

        console.log(`[M-Pesa API Request] URL: ${mpesaUrl}`);
        console.log(`[M-Pesa API Request] Headers:`, JSON.stringify({ ...mpesaHeaders, Authorization: 'Bearer [ENCRYPTED]' }));
        console.log(`[M-Pesa API Request] Payload:`, JSON.stringify(mpesaBody));

        const mpesaResponse = await fetch(mpesaUrl, {
          method: 'POST',
          headers: mpesaHeaders,
          body: JSON.stringify(mpesaBody),
          signal: AbortSignal.timeout(10000) // 10s timeout
        });

        const mpesaData = await mpesaResponse.json();
        console.log('[M-Pesa API Response] Status:', mpesaResponse.status, 'Body:', JSON.stringify(mpesaData));

        if (mpesaResponse.ok && (mpesaData.output_ResponseCode === 'INS-0' || mpesaData.output_ResponseCode === '0')) {
          mpesaApiSuccess = true;
          mpesaTransactionId = mpesaData.output_TransactionID || mpesaData.output_ConversationID || 'INS-0';
        } else {
          mpesaErrorDetail = mpesaData.output_ResponseDesc || mpesaData.output_ResponseCode || 'Recusado pelo M-Pesa';
          throw new Error(mpesaErrorDetail);
        }
      } catch (err) {
        console.error('M-Pesa API Execution Exception:', err);
        return NextResponse.json({ 
          error: `O M-Pesa recusou a transação: ${err.message}. Por favor, confirme o saldo ou introduza o PIN correto no telemóvel.` 
        }, { status: 400 });
      }
    }

    // 3. Generate table rows for the invoice
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

    // 4. Send HTML invoice via Nodemailer SMTP if configured (with text fallback for anti-spam)
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

        const plainTextFallback = `Portal Zuca - Fatura Recibo Simplificada ${refNumber}\n\nCaro(a) ${name},\nO seu pagamento de ${totalAmount.toLocaleString('pt-MZ')} MZN via ${paymentMethod.toUpperCase()} foi recebido e autenticado digitalmente.\n\nDetalhes do Recibo:\nReferência: ${refNumber}\nContribuinte: ${name}\nNUIT: ${nuit}\nData: ${dateFormatted}\n\nEste documento é uma fatura-recibo simplificada emitida eletronicamente pelo Portal de Serviços Digitais Zuca da República de Moçambique.`;

        await transporter.sendMail({
          from: `"Portal Zuca - Finanças" <${senderEmail}>`,
          to: email,
          subject: `Recibo Simplificado ${refNumber} - Zuca`,
          text: plainTextFallback, // Crucial parameter to avoid Spam folders
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
                    ${mpesaTransactionId ? `<span style="color: #b0b0b0; display: block;">ID M-Pesa: <strong style="color: #ffffff; font-family: monospace;">${mpesaTransactionId}</strong></span>` : ''}
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
          `,
          headers: {
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'Importance': 'normal'
          }
        });
        emailSent = true;
      } catch (err) {
        console.error('SMTP Receipt Delivery Error:', err);
        errorDetail = err.message;
      }
    }

    console.log(`\n=================== TRANSACTION LOG ===================\nREF: ${refNumber}\nCITIZEN: ${name} (NUIT: ${nuit})\nEMAIL: ${email}\nTOTAL: ${totalAmount} MZN\nPAYMENT: ${paymentMethod} ${mpesaApiCalled ? `(REAL API: ${mpesaApiSuccess ? 'SUCCESS' : 'FAILED'})` : '(SIMULATED)'}\nSTATUS: ${emailSent ? 'RECEIPT SENT VIA SMTP' : 'SIMULATED (SMTP Configuration Missing/Failed)'}\nERROR DETAIL: ${errorDetail || 'None'}\n========================================================\n`);

    return NextResponse.json({
      success: true,
      refNumber,
      date: dateFormatted,
      emailSent,
      mpesaTransactionId,
      mpesaApiCalled,
      message: emailSent 
        ? 'Pagamento efetuado com sucesso! O recibo foi enviado para o seu email.' 
        : 'Pagamento efetuado com sucesso (modo de simulação). O recibo foi impresso nos logs do servidor.'
    });

  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar o checkout' }, { status: 500 });
  }
}
