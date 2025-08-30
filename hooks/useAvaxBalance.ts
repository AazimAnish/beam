import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits, createPublicClient, http } from "viem";
import { getBalance } from "viem/actions";
import { avalancheFuji } from "@/lib/constants";

const AVAX_COINGECKO_ID = "avalanche-2";
const VS_CURRENCY = "usd";

// Create a public client for direct RPC calls
const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
});

export function useAvaxBalanceInUsd(address: `0x${string}` | undefined) {
  const [avaxPrice, setAvaxPrice] = useState<number | null>(null);
  const [balanceInUsd, setBalanceInUsd] = useState<string>('0.00');
  const [avaxBalance, setAvaxBalance] = useState<string>('0.000');
  const [isLoading, setIsLoading] = useState(true);
  const { chain } = useAccount();

  // Always show balance for Fuji testnet, regardless of current chain
  const shouldFetchBalance = !!address;



  useEffect(() => {
    async function fetchAvaxPrice() {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${AVAX_COINGECKO_ID}&vs_currencies=${VS_CURRENCY}`
        );
        const data = await response.json();
        if (data[AVAX_COINGECKO_ID]?.[VS_CURRENCY]) {
          setAvaxPrice(data[AVAX_COINGECKO_ID][VS_CURRENCY]);
        }
      } catch (error) {
        // Silently handle price fetch errors
      }
    }

    fetchAvaxPrice();
  }, []);

  useEffect(() => {
    async function fetchAvaxBalance() {
      if (!address || !shouldFetchBalance) {
        setBalanceInUsd('0.00');
        setAvaxBalance('0.000');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get native AVAX balance using viem on Fuji testnet
        const balance = await getBalance(publicClient, { address });
        
        const rawAvaxBalance = parseFloat(formatUnits(balance, 18)); // AVAX has 18 decimals
        const formattedAvaxBalance = rawAvaxBalance.toFixed(3);
        setAvaxBalance(formattedAvaxBalance);
        
        if (avaxPrice !== null && avaxPrice > 0) {
          const usdValue = rawAvaxBalance * avaxPrice;
          setBalanceInUsd(usdValue.toFixed(2));
        } else {
          // Show AVAX amount when USD price is not available
          setBalanceInUsd(formattedAvaxBalance);
        }
      } catch (error) {
        setBalanceInUsd('0.00');
        setAvaxBalance('0.000');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvaxBalance();
  }, [address, shouldFetchBalance, avaxPrice]);

  return { 
    balanceInUsd, 
    avaxBalance, 
    isLoading,
    hasPrice: avaxPrice !== null && avaxPrice > 0 
  };
} 