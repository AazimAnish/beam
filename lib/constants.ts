export const USDC_AVALANCHE_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65' as const;
// Note: This is the USDC contract address on Avalanche Fuji testnet.

export const SPONSOR_WALLET_ADDRESS: string = process.env.NEXT_PUBLIC_SPONSOR_WALLET_ADDRESS || '0x...YOUR_SPONSOR_WALLET_ADDRESS';

export const avalancheFuji = {
  id: 43113,
  name: 'Avalanche Fuji',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://api.avax-test.network/ext/bc/C/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Snowtrace', url: 'https://testnet.snowtrace.io' },
  },
} as const; 