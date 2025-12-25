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

        // Use the view function to get token balance
        const balance = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::vibetrax::get_token_balance`,
            typeArguments: [],
            functionArguments: [walletAddress],
          },
        });

        // View function returns array with single u64 value
        setTokenBalance(parseInt(balance[0]));
      } catch (error) {
        // User doesn't have tokens yet - this is normal
        console.log("No token balance found:", error.message);
        setTokenBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBalance();
  }, [walletAddress]);

  return { tokenBalance, isLoading };
};
