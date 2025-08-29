import { useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";

const AVAX_COINGECKO_ID = "avalanche-2";
const VS_CURRENCY = "usd";

export function useAvaxBalanceInUsd(address: `0x${string}` | undefined) {
  const [avaxPrice, setAvaxPrice] = useState<number | null>(null);
  const [balanceInUsd, setBalanceInUsd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

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
    if (!isBalanceLoading && balanceData && avaxPrice !== null) {
      const avaxBalance = parseFloat(formatUnits(balanceData.value, balanceData.decimals));
      const usdValue = avaxBalance * avaxPrice;
      setBalanceInUsd(usdValue.toFixed(2));
      setIsLoading(false);
    } else if (!isBalanceLoading) {
        // Handle case where price might be loading but balance is ready
        setIsLoading(avaxPrice === null);
    }
  }, [balanceData, isBalanceLoading, avaxPrice]);

  return { balanceInUsd, isLoading };
} 