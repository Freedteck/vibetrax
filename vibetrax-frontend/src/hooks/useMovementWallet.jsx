import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";

/**
 * Custom hook to manage wallet state across both Privy and native wallets
 * @returns {Object} Unified wallet state and utilities
 */
export function useMovementWallet() {
  const { authenticated, user, logout } = usePrivy();
  const { account, connected, disconnect, signAndSubmitTransaction } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");

  // Note: signRawHash should be implemented using useSignRawHash hook from Privy
  // For now returning null - implement properly when integrating transactions
  const signRawHash = null;

  // Determine wallet address
  useEffect(() => {
    if (authenticated && user) {
      const moveWallet = user.linkedAccounts?.find(
        (acc) => acc.chainType === "aptos"
      );
      if (moveWallet) {
        setWalletAddress(moveWallet.address);
      }
    } else if (connected && account) {
      setWalletAddress(account.address.toString());
    } else {
      setWalletAddress("");
    }
  }, [authenticated, user, connected, account]);

  // Determine wallet type
  const isPrivyWallet = !!user?.linkedAccounts?.find(
    (acc) => acc.chainType === "aptos"
  );
  const isNativeWallet = connected && !isPrivyWallet;
  const isConnected = authenticated || connected;

  // Unified disconnect function
  const disconnectWallet = async () => {
    try {
      if (authenticated) {
        await logout();
      } else if (connected) {
        await disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      throw error;
    }
  };

  // Get Movement wallet for Privy
  const movementWallet = isPrivyWallet
    ? user?.linkedAccounts?.find((acc) => acc.chainType === "aptos")
    : null;

  return {
    // Connection state
    isConnected,
    isPrivyWallet,
    isNativeWallet,
    walletAddress,

    // Wallet objects
    privyUser: user,
    nativeAccount: account,
    movementWallet,

    // Functions
    signAndSubmitTransaction,
    signRawHash,
    disconnectWallet,

    // Auth state
    authenticated,
    connected,
  };
}
