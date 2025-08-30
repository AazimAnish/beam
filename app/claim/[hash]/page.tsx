'use client'

import { useState, useEffect, use } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { ArrowRight, CheckCircle2, Gift, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Confetti from 'react-confetti';
import GradientBlinds from '@/components/GradientBlinds';


type Transfer = {
  amount: number;
  recipient_email: string;
  status: string;
}

type ClaimStep = 'initial' | 'claimed' | 'card_generated';

interface ClaimPageParams {
  hash: string;
}

export default function ClaimPage({ params }: { params: Promise<ClaimPageParams> }) {
  const { hash } = use(params);
  const { user } = usePrivy();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ClaimStep>('initial');
  const [showConfetti, setShowConfetti] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTransfer() {
      if (!hash) return;
      
      try {
        const { data, error } = await supabase
          .from('transfers')
          .select('*')
          .eq('claim_hash', hash)
          .single();

        if (error) throw new Error(error.message);
        if (data) {
          setTransfer(data);
          if (data.status === 'claimed') {
            setStep('claimed');
          }
        } else {
          setError('Transfer not found.');
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to fetch transfer details.');
      } finally {
        setLoading(false);
      }
    }

    fetchTransfer();
  }, [hash, supabase]);
  

  const handleGenerateCard = async () => {
    setIsProcessing(true);
    toast.loading('Generating your card...');

    try {
      const response = await fetch('/api/claim-by-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimHash: hash }),
      });
      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success("Card generated!");
        setStep('card_generated');
        setShowConfetti(true);
      } else {
        throw new Error(result.message || 'Failed to generate card.');
      }
    } catch (e: unknown) {
      toast.dismiss();
      const errorMessage = e instanceof Error ? e.message : 'Could not generate card.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleClaim = async () => {
    setIsProcessing(true);
    toast.loading('Verifying and claiming your funds...');

    try {
      const response = await fetch('/api/execute-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimHash: hash,
          recipientAddress: user?.wallet?.address,
        }),
      });

      const result = await response.json();
      toast.dismiss();

      if (result.success) {
        toast.success(`Funds sent! Tx: ${result.txHash.slice(0,10)}...`);
        setStep('claimed');
        setShowConfetti(true); // Trigger confetti on success
      } else {
        toast.error(result.message || 'Claim failed.');
      }
    } catch (e: unknown) {
      toast.dismiss();
      const errorMessage = e instanceof Error ? e.message : 'An error occurred during claim.';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderInitialStep = () => (
    <div className="glass-card max-w-md mx-auto space-y-8">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-white/10 border border-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
            <Gift className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold font-sora text-white mb-2">You&apos;ve Received a Payment!</h1>
          <p className="font-ibm-plex-mono text-white/80 text-sm">From: {transfer?.recipient_email}</p>
        </div>

        <div className="text-center py-6">
          <span className="text-7xl font-bold text-white font-ibm-plex-mono">${transfer?.amount}</span>
          <p className="text-2xl font-bold text-gray-400 font-sora mt-2">USDC</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleClaim} 
            disabled={isProcessing}
            className="button-primary w-full h-14 text-lg font-bold"
          >
            {isProcessing ? 'Processing...' : `Claim to Wallet`}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            onClick={handleGenerateCard} 
            disabled={isProcessing}
            className="button-secondary w-full h-14 text-lg font-bold"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Generate a Card
          </Button>
        </div>
      </div>
    </div>
  );
  

  const renderClaimedStep = () => (
    <div className="glass-card max-w-md mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-white/10 border border-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold font-sora text-green-400 mb-2">Funds Claimed!</h1>
        <p className="font-ibm-plex-mono text-white/80">These funds have been successfully transferred to your wallet.</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="glass-card max-w-md mx-auto p-6 text-center font-sora text-white">Loading transfer details...</div>;
    if (error) return <div className="glass-card max-w-md mx-auto p-6 text-center text-red-400 font-sora">{error}</div>;
    
    switch(step) {
      case 'initial': return renderInitialStep();
      case 'claimed': return renderClaimedStep();
      default: return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0A0B0F]">
      {/* GradientBlinds Background */}
      <div className="fixed inset-0 z-0 transition-all duration-700 hover:opacity-75">
        <GradientBlinds
          gradientColors={['#10B981', '#059669', '#047857']}
          angle={120}
          noise={0.28}
          blindCount={10}
          blindMinWidth={85}
          spotlightRadius={0.65}
          spotlightSoftness={1.3}
          spotlightOpacity={0.8}
          mouseDampening={0.12}
          distortAmount={6}
          shineDirection="left"
          mixBlendMode="screen"
        />
      </div>

      {showConfetti && <Confetti recycle={false} />}
      
      {/* Back Button */}
      <Link href="/" passHref>
        <Button className="fixed top-6 left-6 z-20 glass-card h-12 px-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-sm transition-all">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </Link>
      
      <Toaster richColors position="top-center" />
      
      <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-16">
        {renderContent()}
      </main>
    </div>
  );
}