import { useState, useEffect } from "react";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";
import { useMovementWallet } from "./useMovementWallet";

export const useHighQualityLink = (nftAddress) => {
  const { walletAddress } = useMovementWallet();
  const [highQualityLink, setHighQualityLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHighQualityLink = async () => {
      if (!walletAddress || !nftAddress) {
        setHighQualityLink(null);
        return;
      }

      try {
        setIsLoading(true);

        // Use the view function to get high-quality link
        const result = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::vibetrax::get_high_quality_link`,
            typeArguments: [],
            functionArguments: [nftAddress, walletAddress],
          },
        });

        // View function returns Option<String>
        // Result format: { vec: [link] } or { vec: [] }
        const linkVec = result[0]?.vec || [];
        setHighQualityLink(linkVec.length > 0 ? linkVec[0] : null);
      } catch (error) {
        console.log("High-quality link not available:", error.message);
        setHighQualityLink(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighQualityLink();
  }, [walletAddress, nftAddress]);

  return { highQualityLink, isLoading };
};
