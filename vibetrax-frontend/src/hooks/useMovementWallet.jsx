import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useSignRawHash } from "@privy-io/react-auth/extended-chains";
import { useState, useEffect } from "react";
import { aptos } from "../config/movement";
import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from "@aptos-labs/ts-sdk";

/**
 * Custom hook to manage wallet state across both Privy and native wallets
 * @returns {Object} Unified wallet state and utilities
 */
export function useMovementWallet() {
  const { authenticated, user, logout } = usePrivy();
  const { signRawHash } = useSignRawHash();
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
        // Use Privy's signRawHash for Aptos transactions
        console.log("Signing with Privy Aptos wallet:", movementWallet.address);

        // Build the transaction
        const rawTxn = await aptos.transaction.build.simple({
          sender: movementWallet.address,
          data: transactionPayload.data,
        });

        console.log("[Privy] Transaction built successfully");

        // Generate signing message
        const message = generateSigningMessageForTransaction(rawTxn);
        console.log("[Privy] Signing message generated");

        // Convert message to hex
        const toHex = (buffer) => {
          return Array.from(buffer)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        };

        // Sign with Privy wallet
        const { signature: rawSignature } = await signRawHash({
          address: movementWallet.address,
          chainType: "aptos",
          hash: `0x${toHex(message)}`,
        });

        console.log("[Privy] Transaction signed successfully");

        // Clean public key (remove 0x prefix and any leading bytes)
        let cleanPublicKey = movementWallet.publicKey.startsWith("0x")
          ? movementWallet.publicKey.slice(2)
          : movementWallet.publicKey;

        // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
        if (cleanPublicKey.length === 66) {
          cleanPublicKey = cleanPublicKey.slice(2);
        }

        // Create authenticator
        const senderAuthenticator = new AccountAuthenticatorEd25519(
          new Ed25519PublicKey(cleanPublicKey),
          new Ed25519Signature(
            rawSignature.startsWith("0x") ? rawSignature.slice(2) : rawSignature
          )
        );

        console.log("[Privy] Submitting transaction to blockchain");

        // Submit the signed transaction
        const committedTransaction = await aptos.transaction.submit.simple({
          transaction: rawTxn,
          senderAuthenticator,
        });

        console.log(
          "[Privy] Transaction submitted:",
          committedTransaction.hash
        );

        // Wait for confirmation
        const executed = await aptos.waitForTransaction({
          transactionHash: committedTransaction.hash,
        });

        if (!executed.success) {
          throw new Error("Transaction failed");
        }

        console.log("[Privy] Transaction confirmed successfully");

        return { hash: committedTransaction.hash };
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
