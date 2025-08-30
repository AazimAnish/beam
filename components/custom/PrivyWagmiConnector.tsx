"use client";

import { useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useConnect, useDisconnect, useAccount } from 'wagmi';

export function PrivyWagmiConnector() {
  const { ready, authenticated, user } = usePrivy();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  const connectWallet = useCallback(async () => {
    if (!authenticated || !user?.wallet?.address || isConnected) return;
    
    // Find the injected connector (MetaMask, etc.)
    const injectedConnector = connectors.find(c => c.id === 'injected');
    
    if (injectedConnector && typeof window !== 'undefined' && window.ethereum) {
      try {
        await connect({ connector: injectedConnector });
      } catch {
        // Silent error handling for connector issues
      }
    }
  }, [authenticated, user?.wallet?.address, isConnected, connectors, connect]);

  const disconnectWallet = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      await disconnect();
    } catch {
      // Silent error handling
    }
  }, [isConnected, disconnect]);

  useEffect(() => {
    if (!ready) return;

    if (authenticated && user?.wallet?.address && !isConnected) {
      // Privy is authenticated but Wagmi is not connected
      connectWallet();
    } else if (!authenticated && isConnected) {
      // Privy is not authenticated but Wagmi is connected
      disconnectWallet();
    }
  }, [ready, authenticated, user?.wallet?.address, isConnected, connectWallet, disconnectWallet]);

  return null; // This component doesn't render anything
}