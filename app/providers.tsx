'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import type { PrivyClientConfig } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { avalancheFuji } from '@/lib/constants';
import { getWagmiConfig } from '@/lib/wagmi';
import { useState, useEffect } from 'react';

export const privyConfig: PrivyClientConfig = {
    // Replace this with your Privy config
    loginMethods: ['wallet', 'email', 'sms'],
    appearance: {
        theme: 'light',
        accentColor: '#676FFF',
        logo: 'https://toixyqionpecsgljqkje.supabase.co/storage/v1/object/public/img//ChatGPT%20Image%206%20juil.%202025,%2000_46_41.png',
    },
    // Create embedded wallets for users who don't have a wallet
    embeddedWallets: {
        createOnLogin: 'users-without-wallets',
    },
    defaultChain: avalancheFuji,
    supportedChains: [avalancheFuji]
};

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

    const [wagmiConfig] = useState(() => getWagmiConfig())

    // Handle wallet connection errors
    useEffect(() => {
        const handleError = (error: ErrorEvent) => {
            // Filter out WalletConnect connection errors to prevent console spam
            if (error.message?.includes('Connection interrupted') || 
                error.message?.includes('walletProvider?.on is not a function')) {
                console.warn('Wallet connection issue:', error.message);
                return;
            }
            console.error('Unhandled error:', error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={privyConfig}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
} 