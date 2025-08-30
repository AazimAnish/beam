'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import type { PrivyClientConfig } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { avalancheFuji } from '@/lib/constants';
import { getWagmiConfig } from '@/lib/wagmi';
import { AutoSwitchNetwork } from '@/components/custom/AutoSwitchNetwork';
import { PrivyWagmiConnector } from '@/components/custom/PrivyWagmiConnector';
import { useState, useEffect } from 'react';

export const privyConfig: PrivyClientConfig = {
    // Replace this with your Privy config
    loginMethods: ['wallet', 'email'],
    appearance: {
        theme: 'dark',
        accentColor: '#4F46E5',
        logo: '/logo.png',
        showWalletLoginFirst: false,
    },
    // Create embedded wallets for users who don't have a wallet
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
        requireUserPasswordOnCreate: false,
    },
    defaultChain: avalancheFuji,
    supportedChains: [avalancheFuji],
    // Add wallet connection configuration
    walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
};

// Get the singleton wagmi config
const wagmiConfig = getWagmiConfig();

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                retry: 1,
                retryDelay: 1000,
            },
        },
    }))

    // Handle wallet connection errors
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            const errorMessage = error.message || '';
            const filename = error.filename || '';
            
            // Silently handle all wallet-related errors
            if (errorMessage.includes('Connection interrupted') || 
                errorMessage.includes('walletProvider?.on is not a function') ||
                errorMessage.includes('WebSocket connection failed') ||
                errorMessage.includes('WalletConnect') ||
                errorMessage.includes('wallet') ||
                filename.includes('walletconnect') ||
                filename.includes('wagmi')) {
                error.preventDefault();
                return;
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason?.message || event.reason || '';
            const stack = event.reason?.stack || '';
            
            if (typeof reason === 'string' && (
                reason.includes('Connection interrupted') || 
                reason.includes('walletProvider?.on is not a function') ||
                reason.includes('WebSocket connection failed') ||
                reason.includes('WalletConnect') ||
                reason.includes('wallet') ||
                reason.includes('eth_requestAccounts already pending') ||
                reason.includes('Request of type eth_requestAccounts already pending') ||
                stack.includes('walletconnect') ||
                stack.includes('wagmi'))) {
                event.preventDefault();
                return;
            }
        };

        // Remove all console overrides
        // (No console.error or console.warn overrides)

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        
        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            // No console restoration needed
        };
    }, []);

    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={privyConfig}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig}>
                    <PrivyWagmiConnector />
                    <AutoSwitchNetwork />
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
} 