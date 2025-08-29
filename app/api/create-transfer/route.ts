import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail, generateClaimEmailContent } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { senderAddress, recipientEmail, amount, txHash, sharingMethod = 'email' } = await request.json();

  if (!senderAddress || !recipientEmail || !amount || !txHash) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipientEmail)) {
    return NextResponse.json({ success: false, message: 'Invalid email address' }, { status: 400 });
  }

  // Validate sharing method
  const validSharingMethods = ['email', 'whatsapp', 'twitter', 'copy'];
  if (!validSharingMethods.includes(sharingMethod)) {
    return NextResponse.json({ success: false, message: 'Invalid sharing method' }, { status: 400 });
  }
  
  // TODO: In production, verify the txHash on-chain here!
  // This is a critical security step to ensure the sponsor wallet was actually funded.

  const claim_hash = randomUUID();
  const claim_link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/claim/${claim_hash}`;

  const { error } = await supabase
    .from('transfers')
    .insert([
      { 
        sender_address: senderAddress, 
        recipient_email: recipientEmail, 
        amount, 
        initial_tx_hash: txHash,
        claim_hash: claim_hash,
        sharing_method: sharingMethod,
        status: 'funded',
      }
    ]);

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
  
  // Send email notification only if sharing method is email
  if (sharingMethod === 'email') {
    try {
      const { subject, message } = generateClaimEmailContent(amount, claim_link);
      await sendEmail(recipientEmail, subject, message);
      console.log('Email sent successfully');
      return NextResponse.json({ 
        success: true, 
        claimHash: claim_hash,
        notification: 'Email sent successfully'
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Even if email fails, the transfer is created. Return success with warning.
      return NextResponse.json({ 
        success: true, 
        claimHash: claim_hash, 
        warning: 'Transfer created but email notification failed to send'
      });
    }
  }
  
  // For other sharing methods, just return success
  return NextResponse.json({ 
    success: true, 
    claimHash: claim_hash,
    notification: `Transfer created for ${sharingMethod} sharing`
  });
} 