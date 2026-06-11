import { NextResponse } from 'next/server';
import crypto from 'crypto';

const secret = process.env.OTP_SECRET || 'zuca_portal_secure_otp_secret_key_12345';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'E-mail e código OTP são obrigatórios' }, { status: 400 });
    }

    // Retrieve the signed cookie
    const token = request.cookies.get('otp_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Código expirado ou inexistente. Solicite um novo código.' }, { status: 400 });
    }

    const [expires, hash] = token.split('.');
    
    // Check if token has expired
    if (Date.now() > parseInt(expires)) {
      return NextResponse.json({ error: 'Código expirado. Por favor, solicite um novo código.' }, { status: 400 });
    }

    // Recreate the signature using the submitted code
    const data = `${email}:${otp}:${expires}`;
    const calculatedHash = crypto.createHmac('sha256', secret).update(data).digest('hex');

    // Compare signatures
    if (calculatedHash === hash) {
      const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso' });
      
      // Clear the OTP session cookie
      response.cookies.set('otp_session', '', { maxAge: 0 });
      return response;
    } else {
      return NextResponse.json({ error: 'Código de confirmação incorreto.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Erro ao validar o código OTP' }, { status: 500 });
  }
}
