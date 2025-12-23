// Movement blockchain configuration
// This file maintains compatibility with IOTA variable names for easier migration
import {
  TESTNET_TUNE_FLOW_PACKAGE_ID,
  TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
  TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
  TESTNET_TUNE_FLOW_TOKEN_ID,
  TESTNET_TUNE_FLOW_TREASURY_ID,
} from "./constants.js";

// Simple hooks to return Movement contract addresses
// TODO: Update these to use Movement contract addresses once deployed
export const useNetworkVariable = (variableName) => {
  const variables = {
    tunflowPackageId: TESTNET_TUNE_FLOW_PACKAGE_ID,
    tunflowTokenId: TESTNET_TUNE_FLOW_TOKEN_ID,
    tunflowNFTRegistryId: TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
    tunflowSubscriptionId: TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
    tunflowTreasuryId: TESTNET_TUNE_FLOW_TREASURY_ID,
  };
  return variables[variableName];
};

export const useNetworkVariables = (...variableNames) => {
  const variables = {
    tunflowPackageId: TESTNET_TUNE_FLOW_PACKAGE_ID,
    tunflowTokenId: TESTNET_TUNE_FLOW_TOKEN_ID,
    tunflowNFTRegistryId: TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
    tunflowSubscriptionId: TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
    tunflowTreasuryId: TESTNET_TUNE_FLOW_TREASURY_ID,
  };
  
  return variableNames.reduce((acc, name) => {
    acc[name] = variables[name];
    return acc;
  }, {});
};

export const networkConfig = {
  testnet: {
    url: "https://testnet.movementnetwork.xyz/v1",
    variables: {
      tunflowPackageId: TESTNET_TUNE_FLOW_PACKAGE_ID,
      tunflowTokenId: TESTNET_TUNE_FLOW_TOKEN_ID,
      tunflowNFTRegistryId: TESTNET_TUNE_FLOW_NFT_REGISTRY_ID,
      tunflowSubscriptionId: TESTNET_TUNE_FLOW_SUBSCRIPTION_ID,
      tunflowTreasuryId: TESTNET_TUNE_FLOW_TREASURY_ID,
    },
  },
};
