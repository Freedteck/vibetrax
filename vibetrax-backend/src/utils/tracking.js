import { supabase } from "../db/supabase.js";

/**
 * Track a stream event
 */
export async function trackStream(
  userAddress,
  nftAddress,
  duration,
  ipAddress,
  userAgent
) {
  try {
    const { data, error } = await supabase
      .from("streams")
      .insert({
        user_address: userAddress,
        nft_address: nftAddress,
        stream_duration: duration,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error tracking stream:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Track a like event
 */
export async function trackLike(userAddress, nftAddress) {
  try {
    // Check if like already exists
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("user_address", userAddress)
      .eq("nft_address", nftAddress)
      .single();

    if (existing) {
      return { success: false, error: "Already liked this track" };
    }

    const { data, error } = await supabase
      .from("likes")
      .insert({
        user_address: userAddress,
        nft_address: nftAddress,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error tracking like:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove a like
 */
export async function removeLike(userAddress, nftAddress) {
  try {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_address", userAddress)
      .eq("nft_address", nftAddress);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error removing like:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get unclaimed rewards for a user
 */
export async function getUnclaimedRewards(userAddress) {
  try {
    // Get unclaimed streams
    const { data: streams, error: streamsError } = await supabase
      .from("streams")
      .select("nft_address")
      .eq("user_address", userAddress)
      .eq("claimed", false);

    if (streamsError) throw streamsError;

    // Get unclaimed likes
    const { data: likes, error: likesError } = await supabase
      .from("likes")
      .select("nft_address")
      .eq("user_address", userAddress)
      .eq("claimed", false);

    if (likesError) throw likesError;

    const streamsCount = streams?.length || 0;
    const likesCount = likes?.length || 0;

    // Calculate tokens (1 token per stream, 2 tokens per like)
    const tokensEarned = streamsCount * 1 + likesCount * 2;

    // Get unique NFT addresses
    const nftAddresses = [
      ...new Set([
        ...(streams?.map((s) => s.nft_address) || []),
        ...(likes?.map((l) => l.nft_address) || []),
      ]),
    ];

    return {
      success: true,
      data: {
        streams: streamsCount,
        likes: likesCount,
        tokensEarned,
        nftAddresses,
      },
    };
  } catch (error) {
    console.error("Error getting unclaimed rewards:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark rewards as claimed
 */
export async function markRewardsClaimed(userAddress, transactionHash) {
  try {
    // Get unclaimed counts
    const rewardsResult = await getUnclaimedRewards(userAddress);
    if (!rewardsResult.success) throw new Error(rewardsResult.error);

    const { streams, likes, tokensEarned } = rewardsResult.data;

    // Mark streams as claimed
    const { error: streamsError } = await supabase
      .from("streams")
      .update({ claimed: true })
      .eq("user_address", userAddress)
      .eq("claimed", false);

    if (streamsError) throw streamsError;

    // Mark likes as claimed
    const { error: likesError } = await supabase
      .from("likes")
      .update({ claimed: true })
      .eq("user_address", userAddress)
      .eq("claimed", false);

    if (likesError) throw likesError;

    // Record the claim
    const { data: claim, error: claimError } = await supabase
      .from("reward_claims")
      .insert({
        user_address: userAddress,
        streams_count: streams,
        likes_count: likes,
        tokens_earned: tokensEarned,
        transaction_hash: transactionHash,
        status: "completed",
      })
      .select()
      .single();

    if (claimError) throw claimError;

    return { success: true, data: claim };
  } catch (error) {
    console.error("Error marking rewards as claimed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get claim history for a user
 */
export async function getClaimHistory(userAddress) {
  try {
    const { data, error } = await supabase
      .from("reward_claims")
      .select("*")
      .eq("user_address", userAddress)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error getting claim history:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get stream stats for an NFT
 */
export async function getNftStats(nftAddress) {
  try {
    // Get total streams
    const { count: streamsCount, error: streamsError } = await supabase
      .from("streams")
      .select("*", { count: "exact", head: true })
      .eq("nft_address", nftAddress);

    if (streamsError) throw streamsError;

    // Get total likes
    const { count: likesCount, error: likesError } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("nft_address", nftAddress);

    if (likesError) throw likesError;

    // Get unique listeners
    const { data: uniqueListeners, error: listenersError } = await supabase
      .from("streams")
      .select("user_address")
      .eq("nft_address", nftAddress);

    if (listenersError) throw listenersError;

    const uniqueListenersCount = new Set(
      uniqueListeners?.map((s) => s.user_address) || []
    ).size;

    return {
      success: true,
      data: {
        totalStreams: streamsCount || 0,
        totalLikes: likesCount || 0,
        uniqueListeners: uniqueListenersCount,
      },
    };
  } catch (error) {
    console.error("Error getting NFT stats:", error);
    return { success: false, error: error.message };
  }
}
