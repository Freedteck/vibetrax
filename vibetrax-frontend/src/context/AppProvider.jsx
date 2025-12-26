import { useState, useEffect, useCallback, useMemo } from "react";
import { AppContext } from "./AppContext";
import { useMovementWallet } from "../hooks/useMovementWallet";
import { aptos, CONTRACT_ADDRESS } from "../config/movement";
import { supabase } from "../config/supabase";

export const AppProvider = ({ children }) => {
  const { walletAddress, isConnected } = useMovementWallet();

  // Token Balance State
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  // Rewards State
  const [unclaimedRewards, setUnclaimedRewards] = useState({
    streams: 0,
    likes: 0,
    tokensEarned: 0,
    nftAddresses: [],
  });
  const [canClaimRewards, setCanClaimRewards] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  // Music Player State
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  // NFTs State
  const [userNfts] = useState([]); // NFTs fetched from blockchain via useMusicNfts hook

  // Transaction State
  const [isPendingTransaction, setIsPendingTransaction] = useState(false);

  // ==================== REFRESH FUNCTIONS ====================

  /**
   * Fetch token balance from contract
   */
  const refreshTokenBalance = useCallback(async () => {
    if (!walletAddress) {
      setTokenBalance(0);
      return;
    }

    try {
      setIsLoadingBalance(true);

      const balance = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::vibetrax::get_token_balance`,
          typeArguments: [],
          functionArguments: [walletAddress],
        },
      });

      setTokenBalance(parseInt(balance[0]));
    } catch (error) {
      console.log("No token balance found:", error.message);
      setTokenBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [walletAddress]);

  /**
   * Fetch subscription status from contract
   */
  const refreshSubscription = useCallback(async () => {
    if (!walletAddress) {
      setIsSubscribed(false);
      return;
    }

    try {
      setIsLoadingSubscription(true);

      const result = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::vibetrax::is_subscribed`,
          typeArguments: [],
          functionArguments: [walletAddress],
        },
      });

      setIsSubscribed(result[0] === true);
    } catch (error) {
      console.log("Subscription check:", error.message);
      setIsSubscribed(false);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [walletAddress]);

  /**
   * Fetch unclaimed rewards from Supabase and check claim eligibility
   */
  const refreshRewards = useCallback(async () => {
    if (!walletAddress) {
      setUnclaimedRewards({
        streams: 0,
        likes: 0,
        tokensEarned: 0,
        nftAddresses: [],
      });
      setCanClaimRewards(false);
      return;
    }

    try {
      setIsLoadingRewards(true);

      // Fetch unclaimed streams
      const { data: streams, error: streamsError } = await supabase
        .from("streams")
        .select("nft_address")
        .eq("user_address", walletAddress)
        .eq("claimed", false);

      if (streamsError) throw streamsError;

      // Fetch unclaimed likes
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

      // Check claim eligibility (1-hour cooldown)
      try {
        const claimResult = await aptos.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::vibetrax::can_claim_rewards`,
            typeArguments: [],
            functionArguments: [walletAddress],
          },
        });
        setCanClaimRewards(claimResult[0] === true);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // First time claiming - no cooldown
        setCanClaimRewards(true);
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setUnclaimedRewards({
        streams: 0,
        likes: 0,
        tokensEarned: 0,
        nftAddresses: [],
      });
      setCanClaimRewards(false);
    } finally {
      setIsLoadingRewards(false);
    }
  }, [walletAddress]);

  /**
   * Fetch user's NFTs - Triggers refetch via event system
   * Components using useMusicNfts hook will automatically refetch
   */
  const refreshNfts = useCallback(async () => {
    // Dispatch custom event to trigger NFT refetch in components using useMusicNfts
    window.dispatchEvent(new CustomEvent("refetchNfts"));
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshTokenBalance(),
      refreshSubscription(),
      refreshRewards(),
      refreshNfts(),
    ]);
  }, [refreshTokenBalance, refreshSubscription, refreshRewards, refreshNfts]);

  // ==================== EFFECTS ====================

  // Initial load and wallet change
  useEffect(() => {
    if (walletAddress) {
      refreshAll();
    } else {
      // Reset all state when wallet disconnects
      setTokenBalance(0);
      setIsSubscribed(false);
      setUnclaimedRewards({
        streams: 0,
        likes: 0,
        tokensEarned: 0,
        nftAddresses: [],
      });
      setCanClaimRewards(false);
    }
  }, [walletAddress, refreshAll]);

  // ==================== CONTEXT VALUE ====================

  const contextValue = useMemo(
    () => ({
      // User & Wallet State
      walletAddress,
      isConnected,

      // Token & Balance State
      tokenBalance,
      isLoadingBalance,

      // Subscription State
      isSubscribed,
      isLoadingSubscription,

      // Rewards State
      unclaimedRewards,
      canClaimRewards,
      isLoadingRewards,

      // Music Player State
      currentTrack,
      playlist,
      isPlaying,

      // NFTs State
      userNfts,

      // Refresh Functions
      refreshTokenBalance,
      refreshSubscription,
      refreshRewards,
      refreshNfts,
      refreshAll,

      // Player Actions
      setCurrentTrack,
      setPlaylist,
      setIsPlaying,

      // Transaction State
      isPendingTransaction,
      setIsPendingTransaction,
    }),
    [
      walletAddress,
      isConnected,
      tokenBalance,
      isLoadingBalance,
      isSubscribed,
      isLoadingSubscription,
      unclaimedRewards,
      canClaimRewards,
      isLoadingRewards,
      currentTrack,
      playlist,
      isPlaying,
      userNfts,
      refreshTokenBalance,
      refreshSubscription,
      refreshRewards,
      refreshNfts,
      refreshAll,
      isPendingTransaction,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
