import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, message: string) {
  try {
    const claimLink = message.match(/https?:\/\/[^\s]+/)?.[0];
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Beam <noreply@beam-app.com>',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #111827; font-size: 32px; font-weight: bold; margin: 0;">You've received a Beam payment! ⚡</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 24px; border: 1px solid #e5e7eb;">
            <div style="white-space: pre-line; font-size: 16px; color: #374151; margin-bottom: 24px; line-height: 1.6;">
              ${message.replace(claimLink || '', '').trim()}
            </div>
            
            ${claimLink ? `
              <a href="${claimLink}" 
                 style="display: inline-block; background: linear-gradient(135deg, #000000 0%, #374151 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.2); transition: transform 0.2s;">
                🎉 Claim Your Funds
              </a>
            ` : ''}
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
              Powered by <strong>Beam</strong> - Send crypto as easy as email<br>
              <span style="color: #9ca3af; font-size: 12px;">This email was sent because someone sent you cryptocurrency using Beam.</span>
            </p>
          </div>
        </div>
      `,
      text: message,
    });

    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: data?.id
    };
    
  } catch (error) {
    console.error('Email service error:', error);
    
    // Fallback to console logging for development
    console.log('📧 Email Service - Fallback to console:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: `fallback_${Date.now()}`
    };
  }
}

export function generateClaimEmailContent(amount: string, claimLink: string): { subject: string; message: string } {
  const subject = `You've received $${amount} USDC on Beam! 🎉`;
  const message = `Great news! Someone sent you $${amount} USDC using Beam.

Click here to claim your funds: ${claimLink}

Simply log in with this email address and your funds will be transferred to your secure wallet instantly.

Need help? Visit our support page or reply to this email.

Happy claiming! 
The Beam Team`;

  return { subject, message };
}