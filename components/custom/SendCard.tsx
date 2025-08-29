"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSendTransaction, useSwitchChain, useAccount } from "wagmi";
import { parseUnits } from "viem";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SharingMethodSelect, type SharingMethod } from "@/components/custom/SharingMethodSelect";
import { USDC_AVALANCHE_ADDRESS, SPONSOR_WALLET_ADDRESS, avalancheFuji } from "@/lib/constants";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Mail } from "lucide-react";

type SendStep = 'input' | 'link_generated';

export function SendCard() {
  const { ready, authenticated, user } = usePrivy();
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: hash, sendTransaction, isPending, isSuccess, error: transactionError } = useSendTransaction();

  const [email, setEmail] = useState("");
  const [sharingMethod, setSharingMethod] = useState<SharingMethod>("email");
  const [amount, setAmount] = useState("0");
  const [isNotifying, setIsNotifying] = useState(false);
  const [step, setStep] = useState<SendStep>('input');
  const [claimLink, setClaimLink] = useState('');

  const handleKeyPress = (key: string) => {
    if (amount === "0" && key !== ".") {
      setAmount(key);
    } else {
      setAmount(amount + key);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  const handleSubmit = async () => {
    if (!amount || !email) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (chain?.id !== avalancheFuji.id) {
      toast.error("Please switch to the Avalanche Fuji testnet to continue.");
      switchChain({ chainId: avalancheFuji.id });
      return;
    }
    if (!SPONSOR_WALLET_ADDRESS || SPONSOR_WALLET_ADDRESS.includes('...')) {
      toast.error("Sponsor wallet has not been configured.");
      return;
    }

    const amountInUnits = parseUnits(amount, 6);
    
    sendTransaction({
      to: USDC_AVALANCHE_ADDRESS,
      data: `0xa9059cbb${SPONSOR_WALLET_ADDRESS.substring(2).padStart(64, '0')}${amountInUnits.toString(16).padStart(64, '0')}` as `0x${string}`,
    });
  };

  useEffect(() => {
    if (isSuccess && hash) {
      setIsNotifying(true);
      toast.loading("Transaction successful! Notifying recipient...");
      
      fetch('/api/create-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAddress: user?.wallet?.address,
          recipientEmail: email,
          amount: amount,
          txHash: hash,
          sharingMethod: sharingMethod,
        }),
      })
      .then(res => res.json())
      .then(data => {
        toast.dismiss();
        if (data.success) {
          const link = `${window.location.origin}/claim/${data.claimHash}`;
          setClaimLink(link);
          setStep('link_generated');
          if (sharingMethod === 'email') {
            toast.success("Email with claim link sent!");
          } else {
            toast.success("Transfer created! Share the link with your recipient.");
          }
        } else {
          toast.error(data.message || "Failed to create transfer record.");
        }
      })
      .catch((err) => {
        toast.dismiss();
        console.error(err);
        toast.error("An error occurred while notifying the recipient.");
      })
      .finally(() => setIsNotifying(false));
    }
  }, [isSuccess, hash, user?.wallet?.address, email, amount, sharingMethod]);

  useEffect(() => {
    if (transactionError) {
      console.error("Transaction Error:", transactionError);
      toast.error(transactionError.message);
    }
  }, [transactionError]);
  
  if (!ready) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-black bg-white p-8 text-center">
        <p>Loading Wallet Status...</p>
      </Card>
    );
  }

  if (!authenticated || !user?.wallet) {
    return (
      <Card className="w-full max-w-md mx-auto border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black uppercase">Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to send money using the button in the top-left corner.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(claimLink);
    toast.success("Link copied!");
  };

  if (step === 'link_generated') {
    const shareMessage = `I've sent you $${amount} on Beam! Claim it here: ${claimLink}`;
    
    return (
        <Card className="w-full max-w-sm mx-auto border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-black uppercase">
                  {sharingMethod === 'email' ? 'Email Sent!' : 'Share this Link'}
                </CardTitle>
                <CardDescription>
                    {sharingMethod === 'email' 
                      ? `We sent ${email} a secure link to claim $${amount}.`
                      : `Your recipient can claim $${amount} using the link below.`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-4">
                <div className="flex items-center space-x-2 rounded-xl border-2 border-dashed border-black p-3 bg-zinc-100">
                    <input type="text" readOnly value={claimLink} className="w-full bg-transparent outline-none font-mono text-sm" />
                    <Button variant="ghost" size="icon" onClick={copyLink}>
                        <Copy className="h-5 w-5" />
                    </Button>
                </div>
                
                {sharingMethod !== 'email' && (
                  <div className="grid grid-cols-3 gap-2">
                      <a href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">WhatsApp</Button>
                      </a>
                      <a href={`https://t.me/share/url?url=${encodeURIComponent(claimLink)}&text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">Telegram</Button>
                      </a>
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">Twitter</Button>
                      </a>
                  </div>
                )}
                
                <Button className="w-full h-12 text-lg font-bold" onClick={() => setStep('input')}>Send Another</Button>
            </CardContent>
        </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-sm mx-auto border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
      <CardHeader className="text-center pb-0">
        <CardTitle className="text-2xl font-black uppercase">Send with Beam</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        <div className="text-center py-2">
            <span className="text-6xl font-black text-black">${amount}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
                <Button key={key} variant="ghost" className="h-14 text-2xl font-bold" onClick={() => handleKeyPress(key)}>
                    {key}
                </Button>
            ))}
            <Button variant="ghost" className="h-14 text-2xl font-bold" onClick={handleDelete}>
                <ArrowLeft />
            </Button>
        </div>

        <div className="grid gap-3">
          <Label className="font-bold uppercase tracking-wider text-zinc-500">To</Label>
          <div className="flex items-center space-x-2 rounded-xl border-2 border-black p-3 bg-white focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 transition-all">
            <Mail className="h-4 w-4 text-zinc-400" />
            <Input 
                type="email"
                placeholder="recipient@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-medium w-full"
            />
          </div>
          
          <Label className="font-bold uppercase tracking-wider text-zinc-500">Share Via</Label>
          <SharingMethodSelect 
            value={sharingMethod}
            onChange={setSharingMethod}
            disabled={isPending || isNotifying}
          />
        </div>

        <Button
          className="w-full h-12 text-lg font-bold rounded-full bg-black text-white hover:bg-zinc-800 shadow-[4px_4px_0px_#999] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          onClick={handleSubmit}
          disabled={isPending || isNotifying || !email.trim() || parseFloat(amount) <= 0}
        >
          {isPending ? "Sending..." : (isNotifying ? "Notifying..." : `Confirm Payment`)}
        </Button>
      </CardContent>
    </Card>
  )
} 