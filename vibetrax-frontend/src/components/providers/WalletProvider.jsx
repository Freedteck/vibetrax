"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MOVEMENT_CONFIGS, CURRENT_NETWORK } from "../../config/movement";

export function WalletProvider({ children }) {
  // Movement network configuration from aptos.ts
  // Use MAINNET enum but with Movement testnet fullnode URL
  // This is needed for wallet adapter compatibility (Google/Apple wallets don't support CUSTOM)
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
    fullnode: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
  });

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={aptosConfig}
      onError={(error) => {
        console.error("Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
