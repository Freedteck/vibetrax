import { useState, useEffect, useCallback } from "react";
import { supabase } from "../config/supabase";
import { useMovementWallet } from "./useMovementWallet";

export const useStreamTracking = () => {
  const { walletAddress } = useMovementWallet();
  const [unclaimedRewards, setUnclaimedRewards] = useState({
    streams: 0,
    likes: 0,
    tokensEarned: 0,
    nftAddresses: [],
  });

  // Track a stream (minimum 30 seconds)
  const trackStream = useCallback(
    async (nftAddress, duration) => {
      if (!walletAddress || duration < 30) return;

      try {
        const { error } = await supabase.from("streams").insert({
          user_address: walletAddress,
          nft_address: nftAddress,
          stream_duration: duration,
          claimed: false,
        });

        if (error) console.error("Error tracking stream:", error);
      } catch (err) {
        console.error("Error tracking stream:", err);
      }
    },
    [walletAddress]
  );

  // Track a like
  const trackLike = useCallback(
    async (nftAddress) => {
      if (!walletAddress) return;

      try {
        const { error } = await supabase.from("likes").insert({
          user_address: walletAddress,
          nft_address: nftAddress,
          claimed: false,
        });

        if (error && error.code !== "23505") {
          // Ignore unique constraint violation
          console.error("Error tracking like:", error);
        }
      } catch (err) {
        console.error("Error tracking like:", err);
      }
    },
    [walletAddress]
  );

  // Remove a like
  const removeLike = useCallback(
    async (nftAddress) => {
      if (!walletAddress) return;

      try {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_address", walletAddress)
          .eq("nft_address", nftAddress);

        if (error) console.error("Error removing like:", error);
      } catch (err) {
        console.error("Error removing like:", err);
      }
    },
    [walletAddress]
  );

  // Check if user has liked a track
  const hasLiked = useCallback(
    async (nftAddress) => {
      if (!walletAddress) return false;

      try {
        const { data, error } = await supabase
          .from("likes")
          .select("id")
          .eq("user_address", walletAddress)
          .eq("nft_address", nftAddress)
          .single();

        if (error && error.code !== "PGRST116") {
          // Ignore "no rows" error
          console.error("Error checking like:", error);
        }

        return !!data;
      } catch (err) {
        console.error("Error checking like:", err);
        return false;
      }
    },
    [walletAddress]
  );

  // Get unclaimed rewards
  const fetchUnclaimedRewards = useCallback(async () => {
    if (!walletAddress) return;

    try {
      // Get unclaimed streams
      const { data: streams, error: streamsError } = await supabase
        .from("streams")
        .select("nft_address")
        .eq("user_address", walletAddress)
        .eq("claimed", false);

      if (streamsError) throw streamsError;

      // Get unclaimed likes
      const { data: likes, error: likesError } = await supabase
        .from("likes")
        .select("nft_address")
        .eq("user_address", walletAddress)
        .eq("claimed", false);

      if (likesError) throw likesError;

      const streamsCount = streams?.length || 0;
      const likesCount = likes?.length || 0;
      const tokensEarned = streamsCount * 1 + likesCount * 2;

      const nftAddresses = [
        ...new Set([
          ...(streams?.map((s) => s.nft_address) || []),
          ...(likes?.map((l) => l.nft_address) || []),
        ]),
      ];

      setUnclaimedRewards({
        streams: streamsCount,
        likes: likesCount,
        tokensEarned,
        nftAddresses,
      });
    } catch (err) {
      console.error("Error fetching unclaimed rewards:", err);
    }
  }, [walletAddress]);

  // Mark rewards as claimed after blockchain transaction
  const markRewardsClaimed = useCallback(
    async (transactionHash) => {
      if (!walletAddress) return;

      try {
        // Mark streams as claimed
        await supabase
          .from("streams")
          .update({ claimed: true })
          .eq("user_address", walletAddress)
          .eq("claimed", false);

        // Mark likes as claimed
        await supabase
          .from("likes")
          .update({ claimed: true })
          .eq("user_address", walletAddress)
          .eq("claimed", false);

        // Record the claim
        await supabase.from("reward_claims").insert({
          user_address: walletAddress,
          streams_count: unclaimedRewards.streams,
          likes_count: unclaimedRewards.likes,
          tokens_earned: unclaimedRewards.tokensEarned,
          transaction_hash: transactionHash,
          status: "completed",
        });

        // Refresh unclaimed rewards
        await fetchUnclaimedRewards();
      } catch (err) {
        console.error("Error marking rewards as claimed:", err);
      }
    },
    [walletAddress, unclaimedRewards, fetchUnclaimedRewards]
  );

  // Get NFT stats
  const getNftStats = useCallback(async (nftAddress) => {
    try {
      // Get total streams
      const { count: streamsCount } = await supabase
        .from("streams")
        .select("*", { count: "exact", head: true })
        .eq("nft_address", nftAddress);

      // Get total likes
      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("nft_address", nftAddress);

      // Get unique listeners
      const { data: uniqueListeners } = await supabase
        .from("streams")
        .select("user_address")
        .eq("nft_address", nftAddress);

      const uniqueListenersCount = new Set(
        uniqueListeners?.map((s) => s.user_address) || []
      ).size;

      return {
        totalStreams: streamsCount || 0,
        totalLikes: likesCount || 0,
        uniqueListeners: uniqueListenersCount,
      };
    } catch (err) {
      console.error("Error getting NFT stats:", err);
      return { totalStreams: 0, totalLikes: 0, uniqueListeners: 0 };
    }
  }, []);

  // Fetch unclaimed rewards on wallet change
  useEffect(() => {
    if (walletAddress) {
      fetchUnclaimedRewards();
    }
  }, [walletAddress, fetchUnclaimedRewards]);

  return {
    trackStream,
    trackLike,
    removeLike,
    hasLiked,
    unclaimedRewards,
    fetchUnclaimedRewards,
    markRewardsClaimed,
    getNftStats,
  };
};
