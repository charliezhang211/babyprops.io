/**
 * Email Service - Resend API wrapper
 * 使用 Resend REST API 发送邮件，无需 SDK
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.EMAIL_FROM || 'noreply@example.com';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Resend API error:', res.status, text);
      return { success: false, error: text };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err) {
    console.error('Failed to send email:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
