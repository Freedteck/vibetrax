import { useState, useEffect, useCallback } from "react";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";
import { useMovementWallet } from "./useMovementWallet";

export const useRewardsClaim = () => {
  const { walletAddress } = useMovementWallet();
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkClaimEligibility = useCallback(async () => {
    if (!walletAddress) {
      setCanClaim(false);
      return;
    }

    try {
      setIsLoading(true);

      // Use the view function to check claim eligibility
      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::vibetrax::can_claim_rewards`,
          typeArguments: [],
          functionArguments: [walletAddress],
        },
      });

      // View function returns bool (checks 1-hour cooldown)
      setCanClaim(result[0] === true);
    } catch (error) {
      // User doesn't have LastClaimTime resource - first claim is allowed
      console.log("Can claim rewards (first time):", error.message);
      setCanClaim(true);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    checkClaimEligibility();
  }, [walletAddress, checkClaimEligibility]);

  return { canClaim, isLoading, recheckEligibility: checkClaimEligibility };
};
