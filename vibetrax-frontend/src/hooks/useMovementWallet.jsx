import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
// import { _aptos } from "../config/movement";

/**
 * Custom hook to manage wallet state across both Privy and native wallets
 * @returns {Object} Unified wallet state and utilities
 */
export function useMovementWallet() {
  const { authenticated, user, logout, sendTransaction } = usePrivy();
  const {
    account,
    connected,
    disconnect,
    signAndSubmitTransaction: nativeSignAndSubmit,
  } = useWallet();
  const [walletAddress, setWalletAddress] = useState("");

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

  // Unified transaction signing function
  const signAndSubmitTransaction = async (transactionPayload) => {
    try {
      if (isPrivyWallet && movementWallet) {
        // Use Privy's sendTransaction for embedded wallets
        console.log("Signing with Privy wallet:", movementWallet.address);

        // Privy expects just the payload
        const result = await sendTransaction({
          transaction: {
            function: transactionPayload.data.function,
            typeArguments: transactionPayload.data.typeArguments || [],
            functionArguments: transactionPayload.data.functionArguments,
          },
          chainType: "aptos",
        });

        console.log("Privy transaction result:", result);
        return result;
      } else if (isNativeWallet && nativeSignAndSubmit) {
        // Native wallet adapter expects this format directly
        console.log("Signing with native wallet:", account?.address);

        // The wallet adapter's signAndSubmitTransaction expects:
        // { sender: address, data: { function, functionArguments } }
        const transaction = {
          sender: account.address,
          data: transactionPayload.data,
        };

        console.log("Transaction payload:", transaction);

        // Sign and submit using wallet adapter with options
        const options = {
          maxGasAmount: 200000, // Increase gas limit
          gasUnitPrice: 100, // Set gas price
        };

        const result = await nativeSignAndSubmit(transaction, options);
        console.log("Native wallet transaction result:", result);
        return result;
      } else {
        throw new Error("No wallet connected for transaction signing");
      }
    } catch (error) {
      console.error("Transaction signing error:", error);
      throw error;
    }
  };

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
    disconnectWallet,

    // Auth state
    authenticated,
    connected,
  };
}
