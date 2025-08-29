// Email service for Beam - sends claim links via email
// This is a basic implementation - in production you'd use services like:
// - SendGrid, Mailgun, AWS SES, or Resend

export async function sendEmail(to: string, subject: string, message: string) {
  // Production implementation using Resend API
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'noreply@beam-app.com',
        to: [to],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">You've received a Beam payment! ⚡</h1>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
              <a href="${message.match(/https?:\/\/[^\s]+/)?.[0]}" 
                 style="display: inline-block; background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Claim Your Funds
              </a>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
              Powered by Beam - Send crypto as easy as email
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: data.id
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
      message: 'Email logged to console (fallback)',
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