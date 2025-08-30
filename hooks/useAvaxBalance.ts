import { useState, useEffect } from "react";
import { useBalance, useAccount } from "wagmi";
import { formatUnits } from "viem";
import { avalancheFuji } from "@/lib/constants";

const AVAX_COINGECKO_ID = "avalanche-2";
const VS_CURRENCY = "usd";

export function useAvaxBalanceInUsd(address: `0x${string}` | undefined) {
  const [avaxPrice, setAvaxPrice] = useState<number | null>(null);
  const [balanceInUsd, setBalanceInUsd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { chain } = useAccount();

  // Only fetch balance if we're on the correct network
  const isCorrectNetwork = chain?.id === avalancheFuji.id;

  const { data: balanceData, isLoading: isBalanceLoading, error: balanceError } = useBalance({
    address: isCorrectNetwork ? address : undefined, // Only fetch if on correct network
    chainId: avalancheFuji.id, // Explicitly use Fuji testnet
  });

  // Debug logging
  useEffect(() => {
    if (address) {
      console.log('AVAX Balance Hook Debug:', {
        address,
        chainId: avalancheFuji.id,
        currentChainId: chain?.id,
        isCorrectNetwork,
        balanceData,
        isBalanceLoading,
        balanceError
      });
    }
  }, [address, chain?.id, isCorrectNetwork, balanceData, isBalanceLoading, balanceError]);

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
        console.error("Failed to fetch AVAX price:", error);
      }
    }

    fetchAvaxPrice();
  }, []);

  useEffect(() => {
    if (!isBalanceLoading && balanceData && isCorrectNetwork) {
      const avaxBalance = parseFloat(formatUnits(balanceData.value, balanceData.decimals));
      
      if (avaxPrice !== null) {
        const usdValue = avaxBalance * avaxPrice;
        console.log('AVAX Balance Calculation:', {
          rawBalance: balanceData.value.toString(),
          decimals: balanceData.decimals,
          formattedBalance: avaxBalance,
          price: avaxPrice,
          usdValue
        });
        setBalanceInUsd(usdValue.toFixed(2));
      } else {
        // Fallback: show raw balance if price fetch fails
        console.log('AVAX Balance (no price):', {
          rawBalance: balanceData.value.toString(),
          decimals: balanceData.decimals,
          formattedBalance: avaxBalance
        });
        setBalanceInUsd(avaxBalance.toFixed(6)); // Show more decimals for raw balance
      }
      setIsLoading(false);
    } else if (!isBalanceLoading) {
        // Handle case where price might be loading but balance is ready
        setIsLoading(avaxPrice === null);
    }
  }, [balanceData, isBalanceLoading, avaxPrice, isCorrectNetwork]);

  // Reset balance if user switches to wrong network
  useEffect(() => {
    if (!isCorrectNetwork) {
      setBalanceInUsd(null);
      setIsLoading(false);
    }
  }, [isCorrectNetwork]);

  return { balanceInUsd, isLoading };
} 