import { useState, useEffect } from "react";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";
import { useMovementWallet } from "./useMovementWallet";

export const useSubscriptionStatus = () => {
  const { walletAddress } = useMovementWallet();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!walletAddress) {
        setIsSubscribed(false);
        return;
      }

      try {
        setIsLoading(true);

        // Use the view function to check subscription status
        const result = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::vibetrax::is_subscribed`,
            typeArguments: [],
            functionArguments: [walletAddress],
          },
        });

        // View function returns bool
        setIsSubscribed(result[0] === true);
      } catch (error) {
        // User doesn't have subscription - this is normal
        console.log("Subscription check:", error.message);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [walletAddress]);

  return { isSubscribed, isLoading };
};
