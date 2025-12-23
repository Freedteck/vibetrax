import { useState, useEffect } from "react";
import { useMovementWallet } from "./useMovementWallet";

const CONTRACT_ADDRESS =
  "0x0b4abe06065561f88bb89e82712d9a9c3523bc431553a51c8712d82eca5818ac";

// Dummy backend public key for testing (32 bytes)
const DUMMY_PUBLIC_KEY = new Array(32).fill(0);

export const useInitializeContract = () => {
  const [initialized, setInitialized] = useState(false);
  const [checking, setChecking] = useState(true);
  const { signAndExecuteTransaction, walletAddress } = useMovementWallet();

  useEffect(() => {
    checkInitialization();
  }, [walletAddress]);

  const checkInitialization = async () => {
    if (!walletAddress) {
      setChecking(false);
      return;
    }

    try {
      // Check if NFTRegistry exists at contract address
      const response = await fetch(
        `https://testnet.movementnetwork.xyz/v1/accounts/${CONTRACT_ADDRESS}/resource/${CONTRACT_ADDRESS}::vibetrax::NFTRegistry`
      );

      if (response.ok) {
        setInitialized(true);
        console.log("Contract already initialized");
      } else {
        setInitialized(false);
        console.log("Contract not initialized");
      }
    } catch (error) {
      console.error("Error checking initialization:", error);
      setInitialized(false);
    } finally {
      setChecking(false);
    }
  };

  const initialize = async () => {
    if (!walletAddress) {
      throw new Error("No wallet connected");
    }

    try {
      console.log("Initializing contract with address:", walletAddress);

      const payload = {
        data: {
          function: `${CONTRACT_ADDRESS}::vibetrax::initialize`,
          typeArguments: [],
          functionArguments: [DUMMY_PUBLIC_KEY],
        },
      };

      const result = await signAndExecuteTransaction(payload);
      console.log("Contract initialized successfully:", result);

      setInitialized(true);
      return result;
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      throw error;
    }
  };

  return {
    initialized,
    checking,
    initialize,
    checkInitialization,
  };
};
