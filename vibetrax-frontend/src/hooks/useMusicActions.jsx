import toast from "react-hot-toast";
import { useMovementWallet } from "./useMovementWallet";
import { CONTRACT_ADDRESS } from "../config/movement";

export const useMusicActions = () => {
  const { isConnected, signAndSubmitTransaction } = useMovementWallet();

  const voteForTrack = async (nftId, votersData) => {
    if (votersData && votersData.length > 0) {
      toast.error("You already voted for this music");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const toastId = toast.loading("Processing Vote...");

      // Note: The contract doesn't have a vote function, using like functionality
      // This increments like_count on the NFT
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::like_track`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Vote successful!", { id: toastId });
    } catch (error) {
      toast.error("Vote failed: " + (error.message || "Unknown error"));
      console.error(error);
    }
  };

  const purchaseTrack = async (nftId, price) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const toastId = toast.loading("Processing purchase...");

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::purchase_music_nft`,
          typeArguments: [],
          functionArguments: [nftId, price],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Purchase successful!", { id: toastId });
      return true;
    } catch (error) {
      toast.error("Purchase failed: " + (error.message || "Unknown error"));
      console.error(error.message);
      return false;
    }
  };

  const toggleTrackForSale = async (nftId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const toastId = toast.loading("Processing...");

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::toggle_for_sale`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Updated successfully!", { id: toastId });
      return true;
    } catch (error) {
      const errorMsg = error.message || error.toString() || "Unknown error";
      console.error("Toggle for sale error:", error);
      console.error("NFT ID:", nftId);

      if (errorMsg.includes("ENOT_AUTHORIZED") || errorMsg.includes("0x2")) {
        toast.error(
          "Not authorized: You must be the owner to toggle sale status"
        );
      } else {
        toast.error("Update failed: " + errorMsg);
      }
      return false;
    }
  };

  const deleteTrack = async (nftId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const toastId = toast.loading("Deleting track...");

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::delete_nft`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Track deleted!", { id: toastId });
      return true;
    } catch (error) {
      toast.error("Delete failed: " + (error.message || "Unknown error"));
      console.error(error.message);
      return false;
    }
  };

  const subscribe = async (setSubscriptionStatus) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      setSubscriptionStatus("failed");
      return;
    }

    setSubscriptionStatus("subscribing");
    const toastId = toast.loading("Subscribing...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::subscribe_with_move`,
          typeArguments: [],
          functionArguments: ["10000000"], // 0.01 MOVE in octas (8 decimals)
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Subscribed successfully!", { id: toastId });
      setSubscriptionStatus("success");
    } catch (error) {
      toast.error("Subscription failed: " + (error.message || "Unknown error"));
      console.error(error);
      setSubscriptionStatus("failed");
    }
  };

  const subscribeWithTokens = async (setSubscriptionStatus) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      setSubscriptionStatus("failed");
      return;
    }

    setSubscriptionStatus("subscribing");
    const toastId = toast.loading("Subscribing with VIBE tokens...");

    try {
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::subscribe_with_tokens`,
          typeArguments: [],
          functionArguments: [],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Subscribed successfully with tokens!", { id: toastId });
      setSubscriptionStatus("success");
    } catch (error) {
      toast.error("Subscription failed: " + (error.message || "Unknown error"));
      console.error(error);
      setSubscriptionStatus("failed");
    }
  };

  const tipArtist = async (nftId, amount) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      const toastId = toast.loading("Sending tip...");

      // Amount is already in VIBE tokens (integer)
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::tip_artist`,
          typeArguments: [],
          functionArguments: [nftId, amount.toString()],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success(`Tipped ${amount} VIBE tokens successfully!`, {
        id: toastId,
      });
      return true;
    } catch (error) {
      toast.error("Tip failed: " + (error.message || "Unknown error"));
      console.error(error);
      return false;
    }
  };

  const boostSong = async (nftId, amount) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      const toastId = toast.loading("Boosting song...");

      // Amount is already in VIBE tokens (integer)
      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::boost_song`,
          typeArguments: [],
          functionArguments: [nftId, amount.toString()],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success(`Boosted with ${amount} VIBE tokens!`, { id: toastId });
      return true;
    } catch (error) {
      toast.error("Boost failed: " + (error.message || "Unknown error"));
      console.error(error);
      return false;
    }
  };

  const buyTokens = async (moveAmount) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      const toastId = toast.loading("Purchasing VIBE tokens...");

      // Convert MOVE amount to octas (8 decimals)
      const moveInOctas = Math.floor(moveAmount * 100_000_000);
      const vibeTokens = Math.floor(moveAmount * 1000);

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::buy_tokens_with_move`,
          typeArguments: [],
          functionArguments: [moveInOctas.toString()],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success(`Purchased ${vibeTokens.toLocaleString()} VIBE tokens!`, {
        id: toastId,
      });
      return true;
    } catch (error) {
      toast.error("Purchase failed: " + (error.message || "Unknown error"));
      console.error(error);
      return false;
    }
  };

  const claimStreamingRewards = async (nftId) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    try {
      const toastId = toast.loading("Claiming rewards...");

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::claim_streaming_rewards`,
          typeArguments: [],
          functionArguments: [nftId],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success("Rewards claimed successfully!", { id: toastId });
      return true;
    } catch (error) {
      toast.error("Claim failed: " + (error.message || "Unknown error"));
      console.error(error);
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
