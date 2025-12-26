import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Movement network configurations
export const MOVEMENT_CONFIGS = {
  mainnet: {
    chainId: 126,
    name: "Movement Mainnet",
    fullnode: "https://full.mainnet.movementinfra.xyz/v1",
    explorer: "mainnet",
  },
  testnet: {
    chainId: 250,
    name: "Movement Testnet (Bardock)",
    fullnode: "https://testnet.movementnetwork.xyz/v1",
    explorer: "testnet",
  },
};

// Current network (change this to switch between mainnet/testnet)
export const CURRENT_NETWORK = "testnet";

// Initialize Aptos SDK with current Movement network
export const aptos = new Aptos(
  new AptosConfig({
    network: Network.CUSTOM,
    fullnode: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
  })
);

// Your deployed contract address
// This is YOUR account address from .movement/config.yaml where the contract was deployed
export const CONTRACT_ADDRESS =
  "0x56bf575bfd1c8a94f98d099ead8f65d267e1570f5d163e6adeb25a3e4dd5ba5d";

// Utility to convert Uint8Array to hex string
export const toHex = (buffer) => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Get explorer URL based on current network
export const getExplorerUrl = (txHash) => {
  const formattedHash = txHash.startsWith("0x") ? txHash : `0x${txHash}`;
  const network = MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer;
  return `https://explorer.movementnetwork.xyz/txn/${formattedHash}?network=${network}`;
};

// Get address explorer URL
export const getAddressExplorerUrl = (address) => {
  const formattedAddress = address.startsWith("0x") ? address : `0x${address}`;
  return `https://explorer.movementnetwork.xyz/account/${formattedAddress}?network=${MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer}`;
};

// Faucet URL for testnet
export const FAUCET_URL = "https://faucet.movementnetwork.xyz/";
