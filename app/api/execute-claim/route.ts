import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createWalletClient, http, createPublicClient, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji, USDC_AVALANCHE_ADDRESS } from '@/lib/constants';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const { claimHash, recipientAddress } = await request.json();

  if (!claimHash || !recipientAddress) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('claim_hash', claimHash)
      .single();

    if (error || !transfer) {
      return NextResponse.json({ success: false, message: 'Transfer not found' }, { status: 404 });
    }

    if (transfer.status === 'claimed') {
      return NextResponse.json({ success: false, message: 'Transfer already claimed' }, { status: 400 });
    }
    if (transfer.status !== 'funded') {
        return NextResponse.json({ success: false, message: 'Transfer not yet funded' }, { status: 400 });
    }
    
    // Note: OTP verification removed in Beam - email-based authentication via Privy handles security

    const privateKey = process.env.SPONSOR_WALLET_PRIVATE_KEY;
    if (!privateKey) throw new Error('Sponsor wallet private key not configured');
    
    const account = privateKeyToAccount(`0x${privateKey}`);
    
    const walletClient = createWalletClient({
      account,
      chain: avalancheFuji,
      transport: http(),
    });

    const publicClient = createPublicClient({
        chain: avalancheFuji,
        transport: http()
    })

    // Convert amount to proper units (USDC has 6 decimals)
    const amountInUnits = parseUnits(transfer.amount.toString(), 6);

    // Send USDC directly from sponsor wallet to recipient (simple ERC20 transfer)
    const txHash = await walletClient.sendTransaction({
        to: USDC_AVALANCHE_ADDRESS,
        data: `0xa9059cbb${recipientAddress.substring(2).padStart(64, '0')}${amountInUnits.toString(16).padStart(64, '0')}` as `0x${string}`,
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash })

    const { error: updateError } = await supabase
      .from('transfers')
      .update({ status: 'claimed', claim_tx_hash: txHash })
      .eq('claim_hash', claimHash);

    if (updateError) {
        console.error("Failed to update transfer status:", updateError)
        // If this fails, we need manual intervention. The transfer happened.
    }

    return NextResponse.json({ success: true, txHash });

  } catch (error) {
    console.error('Failed to execute claim:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 