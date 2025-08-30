"use client";

import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { avalancheFuji } from "@/lib/constants";
import { toast } from "sonner";

export function AutoSwitchNetwork() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (!isConnected || !chain) return;

    // Check if user is on Fuji network
    const isOnFujiNetwork = chain.id === 43113 || 
                           chain.id === avalancheFuji.id || 
                           chain.name?.toLowerCase().includes('fuji') ||
                           chain.name?.toLowerCase().includes('avalanche');

    if (!isOnFujiNetwork) {
      // Delay the switch to allow wallet connection to complete
      const timer = setTimeout(async () => {
        try {
          toast.loading("Switching to Avalanche Fuji testnet...", { duration: 2000 });
          await switchChain({ chainId: 43113 });
          toast.dismiss();
          toast.success("Successfully switched to Avalanche Fuji testnet!");
        } catch {
          toast.dismiss();
          toast.error("Please switch to Avalanche Fuji testnet to continue");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, chain, switchChain]);

  return null; // This component doesn't render anything
}