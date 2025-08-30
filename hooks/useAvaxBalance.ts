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
  const [isLoading, setIsLoading] = useState(true);
  const { chain } = useAccount();

  // Only fetch balance if we're on the correct network
  const isCorrectNetwork = chain?.id === avalancheFuji.id;



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
      if (!address || !isCorrectNetwork) {
        setBalanceInUsd('0.00');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get native AVAX balance using viem
        const balance = await getBalance(publicClient, { address });
        
        const avaxBalance = parseFloat(formatUnits(balance, 18)); // AVAX has 18 decimals
        
        if (avaxPrice !== null) {
          const usdValue = avaxBalance * avaxPrice;
          setBalanceInUsd(usdValue.toFixed(2));
        } else {
          // Fallback: show raw balance if price fetch fails
          setBalanceInUsd(avaxBalance.toFixed(6)); // Show more decimals for raw balance
        }
      } catch (error) {
        setBalanceInUsd('0.00');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvaxBalance();
  }, [address, isCorrectNetwork, avaxPrice]);

  // Reset balance if user switches to wrong network
  useEffect(() => {
    if (!isCorrectNetwork) {
      setBalanceInUsd('0.00');
      setIsLoading(false);
    }
  }, [isCorrectNetwork]);

  return { balanceInUsd, isLoading };
} 