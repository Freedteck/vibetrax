import { createContext } from "react";

/**
 * Global application context
 * Manages all shared state across the application
 */
export const AppContext = createContext({
  // User & Wallet State
  walletAddress: null,
  isConnected: false,

  // Token & Balance State
  tokenBalance: 0,
  isLoadingBalance: false,

  // Subscription State
  isSubscribed: false,
  isLoadingSubscription: false,

  // Rewards State
  unclaimedRewards: {
    streams: 0,
    likes: 0,
    tokensEarned: 0,
    nftAddresses: [],
  },
  canClaimRewards: false,
  isLoadingRewards: false,

  // Music Player State
  currentTrack: null,
  playlist: [],
  isPlaying: false,

  // NFTs State
  userNfts: [],

  // Refresh Functions
  refreshTokenBalance: () => {},
  refreshSubscription: () => {},
  refreshRewards: () => {},
  refreshNfts: () => {},
  refreshAll: () => {},

  // Player Actions
  setCurrentTrack: () => {},
  setPlaylist: () => {},
  setIsPlaying: () => {},

  // Transaction State
  isPendingTransaction: false,
  setIsPendingTransaction: () => {},
});
