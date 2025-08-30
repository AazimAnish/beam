"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useSwitchChain, useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";

// Window.ethereum is already declared globally

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SharingMethodSelect, type SharingMethod } from "@/components/custom/SharingMethodSelect";
import { USDC_AVALANCHE_ADDRESS, SPONSOR_WALLET_ADDRESS, avalancheFuji } from "@/lib/constants";
import { erc20Abi } from "@/lib/erc20abi";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Mail } from "lucide-react";

type SendStep = 'input' | 'link_generated';

export function SendCard() {
  const { ready, authenticated, user, login } = usePrivy();
  const { chain, isConnected, address } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  

  const { data: hash, writeContract, isPending, isSuccess, error: transactionError } = useWriteContract();

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

    
    // Alternative chain detection using window.ethereum when Wagmi fails
    const getCurrentChainId = async () => {
      if (chain?.id) return chain.id;
      
      // Fallback: Try to get chainId directly from wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const ethereum = window.ethereum as { request: (args: { method: string }) => Promise<string> };
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const numericChainId = parseInt(chainId, 16);
          return numericChainId;
        } catch (error) {
          // Silently handle error
        }
      }
      return null;
    };
    
    const currentChainId = await getCurrentChainId();
    
    // Check if wallet is connected but no chain detected
    if ((isConnected || user?.wallet) && !currentChainId) {
      toast.error("Detecting network... Please wait and try again.");
      return;
    }
    
    // More robust chain validation for Avalanche Fuji
    const isValidChain = (() => {
      if (!currentChainId) {
        return false;
      }
      
      // Direct ID match
      if (currentChainId === 43113 || currentChainId === avalancheFuji.id) {
        return true;
      }
      
      // Name-based matching (case-insensitive) - only if we have chain object
      if (chain?.name) {
        const chainName = chain.name.toLowerCase();
        
        if (chainName.includes('fuji') || 
            chainName.includes('avalanche') ||
            chainName.includes('avax')) {
          return true;
        }
      }
      
      // Additional check for common Fuji testnet variations
      const validChainIds = [43113, 0xa869]; // 43113 in hex is 0xa869
      const isValid = validChainIds.includes(currentChainId);
      return isValid;
    })();
    
    if (!isValidChain) {
      const networkName = chain?.name || 'Unknown';
      const networkId = currentChainId || 'undefined';
      toast.error(`Current network: ${networkName} (ID: ${networkId}). Please switch to Avalanche Fuji testnet.`);
      
      try {
        // Try Wagmi first
        if (switchChain) {
          await switchChain({ chainId: 43113 });
        } else {
          // Fallback to direct wallet request
          if (typeof window !== 'undefined' && window.ethereum) {
            const ethereum = window.ethereum as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa869' }], // 43113 in hex
            });
          }
        }
        
        toast.success("Switched to Avalanche Fuji testnet. Please try again.");
        return;
      } catch (error: unknown) {
        // Handle error silently
        
        // If chain doesn't exist, try to add it
        const errorWithCode = error as { code?: number };
        if (errorWithCode?.code === 4902 && typeof window !== 'undefined' && window.ethereum) {
          try {
            const ethereum = window.ethereum as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xa869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              }],
            });
            toast.success("Avalanche Fuji network added. Please try again.");
          } catch (addError) {
            toast.error("Failed to add Avalanche Fuji network. Please add it manually.");
          }
        }
        return;
      }
    }
    if (!SPONSOR_WALLET_ADDRESS || SPONSOR_WALLET_ADDRESS.includes('...')) {
      toast.error("Sponsor wallet has not been configured.");
      return;
    }

    const amountInUnits = parseUnits(amount, 6);
    
    writeContract({
      address: USDC_AVALANCHE_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [SPONSOR_WALLET_ADDRESS as `0x${string}`, amountInUnits],
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
      .catch(() => {
        toast.dismiss();
        // Silently handle error
        toast.error("An error occurred while notifying the recipient.");
      })
      .finally(() => setIsNotifying(false));
    }
  }, [isSuccess, hash, user?.wallet?.address, email, amount, sharingMethod]);

  useEffect(() => {
    if (transactionError) {
      // Silently handle transaction error
      toast.error(transactionError.message);
    }
  }, [transactionError]);
  
  if (!ready) {
    return (
      <div className="glass-card max-w-md mx-auto text-center">
        <p className="font-sora text-white">Loading Wallet Status...</p>
      </div>
    );
  }

  if (!authenticated || !user?.wallet) {
    return (
      <div className="glass-card max-w-md mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm">
          <svg className="w-10 h-10 text-golden-solid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-4">
          <h2 className="font-sora text-2xl font-bold text-white">Connect Your Wallet</h2>
          <p className="font-ibm-plex-mono text-white/70 text-sm leading-relaxed">
            To send money securely, please connect your wallet below.
          </p>
          <Button
            onClick={login}
            className="button-connect w-full h-12 text-base font-bold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connect Wallet
          </Button>
          <p className="font-ibm-plex-mono text-white/50 text-xs">
            Your wallet connection ensures safe and secure transactions.
          </p>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    navigator.clipboard.writeText(claimLink);
    toast.success("Link copied!");
  };

  if (step === 'link_generated') {
    const shareMessage = `I've sent you $${amount} USDC on Beam! Claim it here: ${claimLink}`;
    
    return (
        <div className="glass-card max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center bg-green-500/20 border border-green-500/30 backdrop-blur-sm">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-sora text-2xl font-bold text-white">
                  {sharingMethod === 'email' ? 'Email Sent Successfully!' : 'Share Your Payment Link'}
                </h2>
                <p className="font-ibm-plex-mono text-white/70 text-sm">
                    {sharingMethod === 'email' 
                      ? `We've sent ${email} a secure link to claim $${amount} USDC.`
                      : `Your recipient can claim $${amount} USDC using the secure link below.`
                    }
                </p>
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
                    <input 
                        type="text" 
                        readOnly 
                        value={claimLink} 
                        className="flex-1 bg-transparent outline-none font-ibm-plex-mono text-sm text-white/90" 
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={copyLink}
                        className="icon-button"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                
                {sharingMethod !== 'email' && (
                  <div className="grid grid-cols-2 gap-4">
                      <a key="whatsapp" href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                            </div>
                            <p className="font-sora text-white text-sm font-semibold">WhatsApp</p>
                          </div>
                      </a>
                      <a key="telegram" href={`https://t.me/share/url?url=${encodeURIComponent(claimLink)}&text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[#0088CC] to-[#229ED9] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                            </div>
                            <p className="font-sora text-white text-sm font-semibold">Telegram</p>
                          </div>
                      </a>
                      <a key="twitter" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`} target="_blank" rel="noopener noreferrer" className="block">
                          <div className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[#1DA1F2] to-[#0d8bd9] rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/30">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                            <p className="font-sora text-white text-sm font-semibold">Twitter</p>
                          </div>
                      </a>
                      <a key="sms" href={`sms:?body=${encodeURIComponent(shareMessage)}`} className="block">
                          <div className="glass-card p-4 text-center hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-[#34C759] to-[#30D158] rounded-xl flex items-center justify-center shadow-lg shadow-green-400/30">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                              </svg>
                            </div>
                            <p className="font-sora text-white text-sm font-semibold">SMS</p>
                          </div>
                      </a>
                  </div>
                )}
                
                <Button 
                    className="button-primary w-full h-12 text-lg font-bold" 
                    onClick={() => setStep('input')}
                >
                    Send Another
                </Button>
            </div>
        </div>
    )
  }
  
  return (
    <div className="glass-card max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="font-sora text-2xl font-bold text-white mb-2">Send with Beam</h2>
        <p className="font-ibm-plex-mono text-white/60 text-sm">
          Simple, secure, and instant money transfers
        </p>
      </div>

      {/* Network Status */}
      {chain && (
        <div className="text-center space-y-3">
          {(() => {
            const isValidChain = (() => {
              if (!chain) return false;
              
              // Direct ID match
              if (chain.id === 43113 || chain.id === avalancheFuji.id) return true;
              
              // Name-based matching (case-insensitive)
              const chainName = chain.name?.toLowerCase() || '';
              if (chainName.includes('fuji') || 
                  chainName.includes('avalanche') ||
                  chainName.includes('avax')) {
                return true;
              }
              
              // Additional check for common Fuji testnet variations
              const validChainIds = [43113, 0xa869]; // 43113 in hex is 0xa869
              return validChainIds.includes(chain.id);
            })();
            
            return (
              <>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isValidChain 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {isValidChain ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Connected to Avalanche Fuji Testnet
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      Wrong Network - Chain ID: {chain.id}
                    </>
                  )}
                </div>
                
                {!isValidChain && (
                  <Button
                    onClick={async () => {
                      try {
                        await switchChain({ chainId: 43113 });
                      } catch (error) {
                        // Handle error silently
                      }
                    }}
                    className="button-primary h-10 text-sm font-bold"
                    disabled={isSwitchingChain}
                  >
                    {isSwitchingChain ? 'Switching...' : 'Switch to Fuji Testnet'}
                  </Button>
                )}
              </>
            );
          })()}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Amount Display */}
        <div className="text-center py-4">
            <span className="text-6xl font-bold text-white font-ibm-plex-mono">${amount}</span>
            <p className="text-white/50 text-sm mt-2">USDC</p>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
                <Button 
                    key={key} 
                    variant="ghost" 
                    className="h-14 text-2xl font-bold bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-ibm-plex-mono transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => handleKeyPress(key)}
                >
                    {key}
                </Button>
            ))}
            <Button 
                variant="ghost" 
                className="h-14 text-2xl font-bold bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white transition-all duration-200 hover:scale-105 active:scale-95" 
                onClick={handleDelete}
            >
                <ArrowLeft />
            </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-sora text-white font-semibold">Recipient Email</Label>
            <div className="input-field flex items-center space-x-3">
              <Mail className="h-4 w-4 text-white/60" />
              <Input 
                  type="email"
                  placeholder="Enter recipient's email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 font-ibm-plex-mono text-white placeholder:text-white/40 flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-sora text-white font-semibold">Share Method</Label>
            <SharingMethodSelect 
              value={sharingMethod}
              onChange={setSharingMethod}
              disabled={isPending || isNotifying}
            />
          </div>
        </div>

        <Button
          className="button-primary w-full h-14 text-lg font-bold"
          onClick={handleSubmit}
          disabled={isPending || isNotifying || !email.trim() || parseFloat(amount) <= 0}
        >
          {isPending ? "Processing..." : (isNotifying ? "Sending..." : `Send $${amount} USDC`)}
        </Button>
      </div>
    </div>
  )
} 