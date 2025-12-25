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
    } catch (error) {
      toast.error("Update failed: " + (error.message || "Unknown error"));
      console.error(error.message);
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

      // Convert MOVE amount to octas (8 decimals)
      const amountInOctas = Math.floor(amount * 100_000_000);

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::tip_artist`,
          typeArguments: [],
          functionArguments: [nftId, amountInOctas.toString()],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success(`Tipped ${amount} MOVE successfully!`, { id: toastId });
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

      // Convert MOVE amount to octas (8 decimals)
      const amountInOctas = Math.floor(amount * 100_000_000);

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::boost_song`,
          typeArguments: [],
          functionArguments: [nftId, amountInOctas.toString()],
        },
      };

      await signAndSubmitTransaction(payload);

      toast.success(`Boosted with ${amount} MOVE!`, { id: toastId });
      return true;
    } catch (error) {
      toast.error("Boost failed: " + (error.message || "Unknown error"));
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
    claimStreamingRewards,
  };
};
