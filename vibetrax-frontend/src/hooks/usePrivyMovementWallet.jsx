import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import {
  createMovementWallet,
  getMovementWallet,
} from "../utils/privyMovement";

/**
 * Hook to manage Privy Aptos/Movement wallet
 * @returns {Object} Wallet state and functions
 */
export function usePrivyMovementWallet() {
  const { ready, authenticated, user } = usePrivy();
  const { createWallet } = useCreateWallet();
  const [movementWallet, setMovementWallet] = useState(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  // Setup Movement wallet when user authenticates
  useEffect(() => {
    const setupWallet = async () => {
      if (!authenticated || !user || isCreatingWallet) return;

      // Check if user already has a Movement wallet
      const existingWallet = getMovementWallet(user);

      if (existingWallet) {
        setMovementWallet(existingWallet);
        setWalletAddress(existingWallet.address);
        console.log("Privy Movement Wallet Address:", existingWallet.address);
      } else {
        // Create a new Movement wallet
        console.log("No Movement wallet found. Creating one now...");
        setIsCreatingWallet(true);
        try {
          const wallet = await createMovementWallet(user, createWallet);
          setMovementWallet(wallet);
          setWalletAddress(wallet.address);
          console.log("Created Privy Movement Wallet Address:", wallet.address);
        } catch (error) {
          console.error("Error creating Movement wallet:", error);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };

    setupWallet();
  }, [authenticated, user, createWallet, isCreatingWallet]);

  return {
    ready,
    authenticated,
    user,
    movementWallet,
    walletAddress,
    isCreatingWallet,
    isConnected: authenticated && !!walletAddress,
  };
}
