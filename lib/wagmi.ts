import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains';
import { avalancheFuji } from '@/lib/constants';
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Create a function that returns config to handle SSR
export function getWagmiConfig() {
  return createConfig({
    chains: [mainnet, avalancheFuji],
    connectors: typeof window !== 'undefined' ? [
      injected(),
      walletConnect({ projectId }),
    ] : [],
    transports: {
      [mainnet.id]: http(),
      [avalancheFuji.id]: http(),
    },
    ssr: true,
  })
}

export const wagmiConfig = getWagmiConfig(); 