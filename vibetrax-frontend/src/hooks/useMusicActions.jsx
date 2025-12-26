import { useMovementWallet } from "./useMovementWallet";
import { useAppContext } from "./useAppContext";
import { CONTRACT_ADDRESS } from "../config/movement";
import {
  showLoadingToast,
  showSuccessToast,
  showErrorToast,
  showError,
} from "../utils/toastHelpers";

export const useMusicActions = () => {
  const { isConnected, signAndSubmitTransaction } = useMovementWallet();
  const {
    refreshTokenBalance,
    refreshSubscription,
    refreshRewards,
    refreshNfts,
  } = useAppContext();

  const voteForTrack = async (nftId, votersData) => {
    if (votersData && votersData.length > 0) {
      showError("You already liked this track");
      return;
    }

    if (!isConnected) {
      showError("Please connect your wallet");
      return;
    }

    const toastId = showLoadingToast("Processing like...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::like_track`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Track liked successfully!");

      // Refresh rewards after successful like
      await refreshRewards();
    } catch (error) {
      console.error("Like error:", error);
      showErrorToast(
        toastId,
        `Like failed: ${error.message || "Unknown error"}`
      );
    }
  };

  const purchaseTrack = async (nftId, price) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Processing purchase...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::purchase_music_nft`,
          typeArguments: [],
          functionArguments: [nftId, price],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Purchase successful!");

      // Refresh token balance and trigger NFT refetch
      await Promise.all([refreshTokenBalance(), refreshNfts()]);

      return true;
    } catch (error) {
      console.error("Purchase error:", error);
      showErrorToast(
        toastId,
        `Purchase failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  const toggleTrackForSale = async (nftId) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Processing...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::toggle_for_sale`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Updated successfully!");

      // Trigger NFT refetch to update sale status
      await refreshNfts();

      return true;
    } catch (error) {
      const errorMsg = error.message || error.toString() || "Unknown error";
      console.error("Toggle for sale error:", error);

      if (errorMsg.includes("ENOT_AUTHORIZED") || errorMsg.includes("0x2")) {
        showErrorToast(
          toastId,
          "Not authorized: You must be the owner to toggle sale status"
        );
      } else {
        showErrorToast(toastId, `Update failed: ${errorMsg}`);
      }
      return false;
    }
  };

  const deleteTrack = async (nftId) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Deleting track...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::delete_nft`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Track deleted!");

      // Trigger NFT refetch to remove deleted track
      await refreshNfts();

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      showErrorToast(
        toastId,
        `Delete failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  const subscribe = async (setSubscriptionStatus) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      setSubscriptionStatus("failed");
      return false;
    }

    setSubscriptionStatus("subscribing");
    const toastId = showLoadingToast("Subscribing...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::subscribe_with_move`,
          typeArguments: [],
          functionArguments: ["10000000"], // 0.01 MOVE in octas (8 decimals)
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Subscribed successfully!");
      setSubscriptionStatus("success");

      // Refresh subscription status
      await refreshSubscription();

      return true;
    } catch (error) {
      console.error("Subscription error:", error);
      showErrorToast(
        toastId,
        `Subscription failed: ${error.message || "Unknown error"}`
      );
      setSubscriptionStatus("failed");
      return false;
    }
  };

  const subscribeWithTokens = async (setSubscriptionStatus) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      setSubscriptionStatus("failed");
      return false;
    }

    setSubscriptionStatus("subscribing");
    const toastId = showLoadingToast("Subscribing with VIBE tokens...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::subscribe_with_tokens`,
          typeArguments: [],
          functionArguments: [],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Subscribed successfully with tokens!");
      setSubscriptionStatus("success");

      // Refresh subscription status and token balance
      await Promise.all([refreshSubscription(), refreshTokenBalance()]);

      return true;
    } catch (error) {
      console.error("Subscription error:", error);
      showErrorToast(
        toastId,
        `Subscription failed: ${error.message || "Unknown error"}`
      );
      setSubscriptionStatus("failed");
      return false;
    }
  };

  const tipArtist = async (nftId, amount) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Sending tip...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::tip_artist`,
          typeArguments: [],
          functionArguments: [nftId, amount],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, `Tipped ${amount} VIBE tokens successfully!`);

      // Refresh token balance after tip
      await refreshTokenBalance();

      return true;
    } catch (error) {
      console.error("Tip error:", error);
      showErrorToast(
        toastId,
        `Tip failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  const boostSong = async (nftId, amount) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Boosting song...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::boost_song`,
          typeArguments: [],
          functionArguments: [nftId, amount],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, `Boosted with ${amount} VIBE tokens!`);

      // Refresh token balance after boost
      await refreshTokenBalance();

      return true;
    } catch (error) {
      console.error("Boost error:", error);
      showErrorToast(
        toastId,
        `Boost failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  const buyTokens = async (moveAmount) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Purchasing VIBE tokens...");

    try {
      // Convert MOVE amount to octas (8 decimals)
      const moveInOctas = Math.floor(moveAmount * 100_000_000);
      const vibeTokens = Math.floor(moveAmount * 1000);

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::buy_tokens_with_move`,
          typeArguments: [],
          functionArguments: [moveInOctas],
        },
      };

      await signAndSubmitTransaction(payload);

      showSuccessToast(
        toastId,
        `Purchased ${vibeTokens.toLocaleString()} VIBE tokens!`
      );

      // Refresh token balance after purchase
      await refreshTokenBalance();

      return true;
    } catch (error) {
      console.error("Token purchase error:", error);
      showErrorToast(
        toastId,
        `Purchase failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  const claimStreamingRewards = async (streams, likes, nftAddresses) => {
    if (!isConnected) {
      showError("Please connect your wallet");
      return false;
    }

    const toastId = showLoadingToast("Claiming rewards...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::claim_streaming_rewards`,
          typeArguments: [],
          functionArguments: [streams, likes, nftAddresses],
        },
      };

      const response = await signAndSubmitTransaction(payload);

      showSuccessToast(toastId, "Rewards claimed successfully!");

      // Refresh token balance and rewards after claim
      await Promise.all([refreshTokenBalance(), refreshRewards()]);

      return response.hash || true;
    } catch (error) {
      console.error("Claim error:", error);
      showErrorToast(
        toastId,
        `Claim failed: ${error.message || "Unknown error"}`
      );
      return false;
    }
  };

  return {
    toggleTrackForSale,
    voteForTrack,
    purchaseTrack,
    deleteTrack,
    subscribe,
    subscribeWithTokens,
    tipArtist,
    boostSong,
    buyTokens,
    claimStreamingRewards,
  };
};
