import { useState, useEffect } from "react";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";
import { useMovementWallet } from "./useMovementWallet";

export const useTokenBalance = () => {
  const { walletAddress } = useMovementWallet();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!walletAddress) {
        setTokenBalance(0);
        return;
      }

      try {
        setIsLoading(true);
        // Try to fetch TokenBalance resource
        const tokenResource = await aptos.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `${CONTRACT_ADDRESS}::vibetrax::TokenBalance`,
        });

        if (tokenResource && (tokenResource.data || tokenResource.vec)) {
          // TokenBalance is a positional struct: TokenBalance(balance)
          // API returns data with _0 property or vec array
          const balance = tokenResource?._0 || tokenResource.vec?.[0] || 0;
          setTokenBalance(parseInt(balance));
        } else {
          setTokenBalance(0);
        }
      } catch (error) {
        // User doesn't have TokenBalance resource yet
        console.log("No token balance found", error);
        setTokenBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBalance();
  }, [walletAddress]);

  return { tokenBalance, isLoading };
};
