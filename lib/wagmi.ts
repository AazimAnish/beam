import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains';
import { avalancheFuji } from '@/lib/constants';
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// Create a function that returns config to handle SSR
export function getWagmiConfig() {
  const connectors = [];
  
  if (typeof window !== 'undefined') {
    try {
      connectors.push(injected({
        shimDisconnect: true,
      }));
      
      connectors.push(walletConnect({ 
        projectId,
        metadata: {
          name: 'Beam',
          description: 'Send crypto to anyone, anywhere, with just an email address',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://beam.app',
          icons: ['https://toixyqionpecsgljqkje.supabase.co/storage/v1/object/public/img//ChatGPT%20Image%206%20juil.%202025,%2000_46_41.png']
        },
        showQrModal: false,
      }));
    } catch (error) {
      // Silently handle connector initialization errors
    }
  }

  return createConfig({
    chains: [mainnet, avalancheFuji],
    connectors,
    transports: {
      [mainnet.id]: http(),
      [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    },
    ssr: true,
    multiInjectedProviderDiscovery: false,
  })
}

export const wagmiConfig = getWagmiConfig(); 